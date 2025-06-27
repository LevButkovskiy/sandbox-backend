import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from "dotenv";
import express from 'express';
import webpush from 'web-push';
const app = express();
const port = 3000

dotenv.config()

app.use(cors());
app.use(bodyParser.json());

const VAPID_KEYS = {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
}

webpush.setVapidDetails(
  'mailto:test@example.com',
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);


// 🗃 Храним подписки (в реальности — база данных)
const subscriptions: webpush.PushSubscription[] = [];

app.get("/", (req, res) => {
    res.send("Hello world")
})

app.post('/subscribe', (req, res) => {
  const subscription: webpush.PushSubscription = req.body;

  subscriptions.push(subscription);
  console.log('✅ Подписка добавлена:', subscription.endpoint);

  res.status(201).json({ success: true });
});

app.post('/send-notification', async (req, res) => {
  const payload = JSON.stringify({
    title: '🔥 Push от сервера',
    body: 'Уведомление через VAPID и web-push!',
  });

  try {
    await Promise.all(subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload)
    ));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка отправки:', err);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${port}`);
});