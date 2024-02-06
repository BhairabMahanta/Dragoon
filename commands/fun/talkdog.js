const fs = require('fs');
const ownerIds  = ['537619455409127442', '169160763091451904'];
module.exports = {
  name: 'talkdog',
  description: 'Set auto-response for a keyword.',
  execute(client, message, args) {
    // Check if the command is executed by the bot owner
    if (!ownerIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 3) {
      return message.reply(`Usage: a!talkdog <<keyword>> <&response&>`);
    }
let keyword;
let response;
let multiKey;
    const channelId = args[0].replace(/[<#>]/g, ''); // Extract channel ID from mention
    try{
 
   const regex = /<<([^>]+?)(?:\s*==\s*([^>]+?))*>>(?:\s*==\s*([^>]+?))*/g;
    if (args.join(' ').match(regex) ){
    multiKey = args.join(' ').match(regex);
    console.log('multiKey', multiKey);
    multiKey = multiKey[0].replace(/<<|>>/g, '');
    console.log('multiKey2', multiKey);
   
multiKey = multiKey.split('==');
keyword = multiKey;
console.log('multiKey3', multiKey)
  
}
if (!multiKey){
  keyword = args.join(' ').match(/<<([^>]+)>>/)?.[1];
}
       console.log('keyword',keyword)
       response = args.join(' ').match(/<&([^&]+)&>/)?.[1];


        console.log('response', response)
  
      if (!keyword || !response) {
        return message.reply('Invalid format for keyword or response. Please use "<<keyword>>" and "<&response&>".');
      }
    }catch(e){
      return message.reply(`Usage: a!talkdog <<keyword>> <&response&>`);
    }

    // Read current settings
       // Load current settings
       const settings = require('./watching.json');

       // Check if channel already exists in settings
       const channelData = settings.channels[channelId];
   
      //  if (channelData && channelData.stats && channelData.stats.keywords) {
      //    return message.reply('This channel is already being watched.');
      //  }

    // Check if the channel exists in settings
    if (!channelData) {
      return message.reply('This channel is not being watched. Use a!watchdog to activate it.');
    }

    // Check if the channel has a keywords array
    if (!channelData.keywords) {
      settings.channels[channelId].keywords = [];
    } else {
      // Check if the keyword already exists
      const keywordData = channelData.keywords.find(kw => kw.keyword === keyword);
      if (keywordData) {
        return message.reply(`Keyword "${keyword}" already exists in <#${channelId}>.`);
      }
    }

    // Add keyword-response pair to the array
    settings.channels[channelId].keywords.push({ keyword, response });

    // Save updated settings
    fs.writeFileSync('./commands/fun/watching.json', JSON.stringify(settings, null, 2));

    return message.reply(`Auto-response set for "${keyword}" -> "${response}" in <#${channelId}>`);
  },
};
