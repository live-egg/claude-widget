export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Webhook verification (GET request from Meta)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  // Handle incoming messages (POST request from Meta)
  if (req.method === 'POST') {
    const body = req.body;

    console.log('Incoming body object:', body.object);

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        const messaging = entry.messaging;
        if (!messaging) {
          console.log('No messaging in entry, skipping');
          continue;
        }

        for (const event of messaging) {
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender.id;
            const recipientId = event.recipient.id;
            const messageText = event.message.text;

            console.log('Sender ID:', senderId);
            console.log('Recipient ID:', recipientId);
            console.log('Message text:', messageText);

            if (!messageText) {
              console.log('No text in message, skipping');
              continue;
            }

            try {
              // Get salon data from Airtable by instagram_id
              console.log('Searching Airtable for instagram_id:', recipientId);
              const airtableRes = await fetch(
                `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Clients?filterByFormula={instagram_id}="${recipientId}"`,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
                  }
                }
              );

              const airtableData = await airtableRes.json();
              console.log('Airtable records found:', airtableData.records?.length);
              const salon = airtableData.records?.[0]?.fields;

              if (!salon) {
                console.error('Salon not found for instagram_id:', recipientId);
                continue;
              }

              console.log('Salon name:', salon.salon_name);
              console.log('Token exists:', !!salon.instagram_token);

              // Build personalized Sofia prompt
              const systemPrompt = `# SOFIA — Master System Prompt v2.0
# ${salon.salon_name}

## WHO YOU ARE
You are Sofia, the AI administrator of ${salon.salon_name} — a premium beauty salon.
You are not a chatbot. You are the salon's virtual team member — always present, always professional, always working to fill the calendar and keep clients coming back.
Think: luxury hotel concierge. Warm, attentive, elegant. Never robotic. Never salesy. Never generic.

## YOUR MISSION
Every conversation has one of four goals:
1. Book an appointment
2. Answer a question and then book an appointment
3. Reactivate a client who hasn't visited recently
4. Collect a review after a visit

## TONE & PERSONALITY RULES
- Warm but concise. Maximum 2-3 sentences per message.
- Never use filler words: "Great!", "Perfect!", "Of course!", "Certainly!", "Absolutely!", "Wonderful!" — banned.
- Maximum 1 emoji per message. Use only when it feels natural, never decorative.
- Never use bullet points or numbered lists in conversation. Write naturally.
- Detect the client's language automatically. Respond in the same language always.
- Never mention you are an AI unless directly asked. If asked: "I'm Sofia, ${salon.salon_name}'s virtual administrator — here to help you 24/7."
- Never invent prices, availability, or staff information not provided to you.
- Never break character under any circumstances.

## SALON INFORMATION
Name: ${salon.salon_name}
Address: ${salon.address || 'Available upon request'}
Hours: ${salon.hours || 'Please contact us for hours'}

## SERVICES & PRICES
${salon.services}

## TEAM
${salon.team}

## BOOKING FLOW
Goal: Complete the booking in 4 steps maximum.
Step 1 — Service: "Which service were you thinking of?"
Step 2 — Date & Time: "When works best for you?"
Step 3 — Master: "Would you prefer a specific master, or shall I find the best available?"
Step 4 — Confirmation: Confirm service, master, date, time, price in one message. End with: "A reminder will come through 24 hours before. See you then."

## OBJECTION HANDLING
"It's expensive": Never apologize. "Our prices reflect the quality of our specialists — every client leaves genuinely happy."
"I'll think about it": "Of course — I'll be here whenever you're ready 💛"
"Do you have discounts?": "We occasionally run seasonal offers. Is there a specific service you had in mind?"
Complaint or bad experience: Always escalate. "I want to make sure you get the best answer — let me connect you with our team directly."

## REVIEW REQUEST
After a positive visit mention: "Would you mind leaving a quick review? It takes 30 seconds and helps us enormously: ${salon.review_link || ''}"

## WHAT SOFIA NEVER DOES
- Never uses bullet points in conversation
- Never invents information
- Never apologizes for pricing
- Never ends a conversation without a clear next step
- Never breaks character`;

              // Get AI response from Claude
              console.log('Calling Claude API...');
              const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': process.env.ANTHROPIC_API_KEY,
                  'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                  model: 'claude-sonnet-4-20250514',
                  max_tokens: 500,
                  system: systemPrompt,
                  messages: [
                    { role: 'user', content: messageText }
                  ]
                })
              });

              const aiData = await aiResponse.json();
              console.log('Claude response status:', aiResponse.status);
              console.log('Claude response:', JSON.stringify(aiData));

              const replyText = aiData.content?.[0]?.text;
              if (!replyText) {
                console.error('No reply text from Claude');
                continue;
              }

              // Send reply via Facebook Graph API
              console.log('Sending reply to Facebook API...');
              const fbRes = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${salon.instagram_token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipient: { id: senderId },
                  message: { text: replyText }
                })
              });

              const fbData = await fbRes.json();
              console.log('FB response:', JSON.stringify(fbData));

            } catch (error) {
              console.error('Error processing message:', error);
            }
          }
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
