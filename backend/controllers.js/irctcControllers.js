const irctcModel=require('../models/irctcModel');
const common=require('../helpers/common')
const irctcServices=require('../services/irctcServices');
const connection=require('../helpers/connection')
const { google } = require('googleapis');


const { OAuth2Client } = require('google-auth-library');
const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);


exports.getEmails=async (req, res) => {
    const { access_token } = req.body; // Access token and sender email address from frontend
  
    try {
      oauth2Client.setCredentials({ access_token });
  
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // Fetch messages from the specified sender
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: `from:santhikimidi123@gmail.com`, // Gmail search query
        maxResults: 3, // Limit results to 3
      });
  
      const messages = response.data.messages || [];
      if (messages.length === 0) {
        return res.json({ emails: [] });
      }
  
      const emailDetails = [];
      for (const message of messages) {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });
  
        // Extract subject and sender
        const headers = email.data.payload.headers;
        const subjectHeader = headers.find(header => header.name === 'Subject');
        const fromHeader = headers.find(header => header.name === 'From');
  
        // Extract email body
        const parts = email.data.payload.parts;
        let body = '';
  
        // Check if the email contains parts (plain text, HTML, etc.)
        if (parts) {
          for (const part of parts) {
            if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
              body = part.body.data;
              body = Buffer.from(body, 'base64').toString('utf-8'); // Decode from base64
              break;
            }
          }
        } else {
          // If there's no parts, the body might be directly in the "body" property
          body = email.data.payload.body.data;
          body = Buffer.from(body, 'base64').toString('utf-8'); // Decode from base64
        }
  
        emailDetails.push({
          subject: subjectHeader ? subjectHeader.value : 'No Subject',
          from: fromHeader ? fromHeader.value : 'No Sender',
          body: body,
        });
      }
  
      // console.log(emailDetails);
  
      let emailData=[];
      for (const item of emailDetails) {
        // console.log(item);
  
        const textBody = item.body; 
        const subject = item?.subject;
        if (!subject) {
            continue;
        }
  
        const classification =await common.classifyIrctcEmail(subject);
        // console.log(classification);
        if(classification !='Unknown')
        {
            const ticketInfo =await common.extractTicketInfo(textBody, classification);
            if(classification=='CancelTicket' && ticketInfo['PNR No'])
            {
                await irctcServices.updateTicketToCanceL("Cancelled",ticketInfo["PNR No"],ticketInfo["Refund Amount"])
            }
            if(ticketInfo['Status']=='Refund' && ticketInfo['PNR No'])
            {
                await irctcServices.updateTicketToCanceL("Refund Success",ticketInfo["PNR No"],ticketInfo["Refund Amount"])
            }
            if(classification=="Booking Confirmation" && ticketInfo['PNR No']){
                if(ticketInfo)
                {
                    const data=await irctcModel.findOne({ "PNR No": ticketInfo["PNR No"] })
                    if(!data)
                    {
                        const newData=new irctcModel({
                            ...ticketInfo
                        })
                        await newData.save();
                    }
                   
                }
                else{
                    console.log("email already read");
                }
            }
            emailData.push({ subject, classification, ticketInfo });
        }
  
      }
  
      res.json(emailData);
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).send('Error fetching emails');
    }
}



exports.getExistedEmails=async(req,res)=>{
  try{
      const data=await irctcModel.find();
      res.json(data);
  }
  catch(error)
  {
    console.error('Error fetching emails:', error);
    res.status(500).send('Error fetching emails');
  }

}