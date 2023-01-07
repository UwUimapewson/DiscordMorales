const Discord = require('discord.js');
const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;

// Replace these placeholder values with your own Discord and email account details
const DISCORD_BOT_TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const EMAIL_USERNAME = 'YOUR_EMAIL_ADDRESS';
const EMAIL_PASSWORD = 'YOUR_EMAIL_PASSWORD';

// Create a new Discord client, ignore this sky
const client = new Discord.Client();

// Connect to the Discord API when the bot is ready, also ignore
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Set up the IMAP client, put in your credentials here
const imap = new Imap({
  user: EMAIL_USERNAME,
  password: EMAIL_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

// Open the mailbox and retrieve all unread emails, ignore this
imap.once('ready', () => {
  imap.openBox('INBOX', true, (error, box) => {
    if (error) {
      console.error(error);
      return;
    }

    const searchCriteria = ['UNSEEN'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT'],
      struct: true
    };

    imap.search(searchCriteria, fetchOptions, (error, messages) => {
      if (error) {
        console.error(error);
        return;
      }

      const messagesToProcess = messages.length;
      let processedCount = 0;

      // Process each email, ignore this
      messages.forEach(message => {
        simpleParser(imap, message.parts[1].body, (error, parsedEmail) => {
          if (error) {
            console.error(error);
            return;
          }

          // Get the email subject and body, ignore this
          const subject = parsedEmail.subject;
          const body = parsedEmail.text;

          // Post the email to the Discord channel, put in the channel id where it says DISCORd_CHANNEL_ID
          client.channels.cache.get('DISCORD_CHANNEL_ID').send(`**${subject}**\n${body}`);

          // Mark the email as read
          imap.addFlags(message.attributes.uid, 'SEEN', error => {
            if (error) {
              console.error(error);
              return;
            }

            processedCount += 1;

            // If all emails have been processed, close the connection
            if (processedCount === messagesToProcess) {
              imap.end();
            }
          });
        });
      });
    });
  });
});

// Log in to Discord, ignore this
client.login(DISCORD_BOT_TOKEN);

// Handle errors
imap.once('error', error => {
  console.error(error);
});

imap.once('end', ()
