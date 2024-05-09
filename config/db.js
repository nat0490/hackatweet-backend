const WebSocket = require('ws');
const { MongoClient } = require('mongodb');

MongoClient.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données :', err);
    return;
  }
  console.log('Connexion à la base de données établie');

  // Configurer un serveur WebSocket
  const wss = new WebSocket.Server({ port: 8080 });

  // Lorsqu'un client se connecte au serveur WebSocket
  wss.on('connection', (ws) => {
    console.log('Nouvelle connexion WebSocket établie');

    // Envoyer un message au client WebSocket
    ws.send('Bienvenue sur le serveur WebSocket');

    // Gérer les messages reçus du client WebSocket
    ws.on('message', (message) => {
      console.log('Message reçu du client WebSocket :', message);
    });
  });

  // Lorsqu'un changement est détecté dans la base de données
  function handleDatabaseChange() {
    // Envoyer une notification aux clients connectés via WebSocket
    wss.clients.forEach(client => {
      client.send('databaseChanged');
    });
  }

  // Mettre en place les Change Streams pour surveiller les changements dans la base de données
  // Assurez-vous de déclencher handleDatabaseChange() lorsqu'un changement est détecté
});
