// const irctc=require('../Models/IRCTCMailModel');
const { google } = require('googleapis');


const { OAuth2Client } = require('google-auth-library');
const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const flipkartModel=require('../models/flipkartModel');
const common=require('../helpers/common')
// const { htmlToText } = require('html-to-text');
const irctcServices=require('../services/irctcServices');



exports.getAllFlipkartEmailData=async (req, res) => {
    const { access_token } = req.body; // Access token and sender email address from frontend
  
    try {
      oauth2Client.setCredentials({ access_token });
  
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // Fetch messages from the specified sender
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: `from:mohanpatro982@gmail.com`, // Gmail search query
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
            const classification =await  common.classifyEmail(subject);
            console.log(classification);
            if(classification !='Unknown')
            {
                const ticketInfo =await common.extractFlipkartOrderInfo(textBody, classification);

                if (classification === "Order Cancellation") {
                    const updatedOrder = await flipkartModel.findOne({ orderID: ticketInfo['orderID'] });
                    if (updatedOrder) {
                        updatedOrder.status = 'Order Cancelled';
                        updatedOrder.refundAmount = ticketInfo.refundAmount;
                        await updatedOrder.save(); // Ensure the update is persisted
                    }
                }


                if (classification === "Order Return") {
                    const updatedOrder = await flipkartModel.findOne({ orderID: ticketInfo['orderID'] });
                    if (updatedOrder) {
                        updatedOrder.status = 'Order return';
                        updatedOrder.refundAmount = ticketInfo.refundAmount;
                        await updatedOrder.save(); // Ensure the update is persisted
                    }
                }


                if (classification === "Refund Success") {
                    const updatedOrder = await flipkartModel.findOne({ orderID: ticketInfo['orderID'] });
                    if (updatedOrder) {
                        updatedOrder.status = 'refundSuccess';
                        updatedOrder.refundAmount = ticketInfo.refundAmount;
                        await updatedOrder.save(); // Ensure the update is persisted
                    }
                }



                if(classification=="Order Placed")
                {
                    const neworder=new flipkartModel(ticketInfo)
                    await neworder.save();

                }
               
                emailData.push({ subject, classification, ticketInfo });
            }
          
        }
        // connection.end();
        // res.json(emailData);
        // const data=await flipkartModel.find();

        res.send(emailData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading emails');
    }
}




exports.getAllFlipkartExisedData=async (req,res)=>{
    try{

        console.log("hello i am at the api");
        const data=await flipkartModel.find();
        console.log(data);
        return res.send(data);

    }
    catch(error){
        console.log(error);
        // return await common.error2(error);
        res.send(error);    
    }
}   