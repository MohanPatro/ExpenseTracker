// const imaps = require('imap-simple');
// const imaps = require('imap-simple');
// const { htmlToText } = require('html-to-text');

module.exports={
    async error2(res, message = "Internal Server Error") {
        res.status(402).json({ success: false, data: {}, message });
    },
    

    // async getImapConfiguration(){
    //     const config = {
    //         imap: {
    //             user: 'venkyganisetti23ce@gmail.com',
    //             password: 'gatd ylir hley gmhu',
    //             host: 'imap.gmail.com',
    //             port: 993,
    //             tls: true,
    //             authTimeout: 3000,
    //             tlsOptions: { rejectUnauthorized: false }
    //         }
    //     }

    //     return config;
    // },
    


    async cleanMailBody(mailBody) {
        return mailBody.replace(/\*+/g, '');
    },

    async extractTicketInfo(mailBody, classification) {
        let ticketInfo = {};


        mailBody = await this.cleanMailBody(mailBody);

        // console.log(mailBody);z  


        if (classification === "CancelTicket") {
            const pnrPattern = /PNR\s*Number\s*:\s*(\d+)/;
            const cancelledDatePattern = /cancelled\s*on\s*:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/; // Adjust regex as needed
            const refundPattern = /refund amount of\s*Rs\.\s*(\d+\.\d+)/;

            const pnrMatch = mailBody.match(pnrPattern);
            const cancelledDateMatch = mailBody.match(cancelledDatePattern);
            const refundMatch = mailBody.match(refundPattern);

            if (pnrMatch) ticketInfo['PNR No'] = pnrMatch[1];
            if (cancelledDateMatch) ticketInfo['Cancelled Date'] = cancelledDateMatch[1];
            if (refundMatch) ticketInfo['Refund Amount'] = refundMatch[1];

            // Set status to "Cancelled"
            ticketInfo.Status = "Cancelled";
            
        } else if (classification === "Booking Confirmation") {
            const pnrPattern = /PNR No\.?\s*:\s*(\d+)/;
            const datePattern = /Date of Journey\s*:\s*(\d{2}-[A-Za-z]+-\d{4})/;  // Match Date of Journey like 10-Aug-2024
            const sourcePattern = /From\s*:\s*([\w\s]+)\s*\([\w]+\)/;  // Capture Source Station like "SRIKAKULAM ROAD"
            const destinationPattern = /To\s*:\s*([\w\s]+)\s*\([\w]+\)/;  // Capture Destination Station like "RAJAHMUNDRY"
            const trainPattern = /Train No\. \/ Name\s*:\s*(\d{5})\s*\/\s*([\w\s]+)/;  // Capture Train No. and Name
            const farePattern = /Total Fare\s*Rs\.\s*(\d+\.\d+)/;

            // Matching PNR
            const pnrMatch = mailBody.match(pnrPattern);
            if (pnrMatch) ticketInfo['PNR No'] = pnrMatch[1];

            // Matching Date of Journey
            const dateMatch = mailBody.match(datePattern);
            if (dateMatch) ticketInfo['Date of Journey'] = dateMatch[1];

            let dateString=dateMatch[1];
            
            
            const currentDate = new Date(); // Get the current date

            const journeyDate = new Date(dateString); // Parse the journey date

            // Matching Source Station (From)
            const sourceMatch = mailBody.match(sourcePattern);
            if (sourceMatch) ticketInfo['Source Station'] = sourceMatch[1].trim();

            // Matching Destination Station (To)
            const destinationMatch = mailBody.match(destinationPattern);
            if (destinationMatch) ticketInfo['Destination Station'] = destinationMatch[1].trim();

            // Matching Train No. and Name
            const trainMatch = mailBody.match(trainPattern);
            if (trainMatch) ticketInfo['Train Name'] = `${trainMatch[1]} / ${trainMatch[2].trim()}`;

            // Matching Total Fare (Amount)
            const fareMatch = mailBody.match(farePattern);
            if (fareMatch) ticketInfo['BookingAmount'] = fareMatch[1];
            ticketInfo.Status = journeyDate < currentDate ? 'Journey Completed' : 'Upcoming Journey'; // Compare dates;

        }   
        else if (classification === "Refund") {
            const pnrPattern = /PNR Number\s*(\d+)/;
            const refundDatePattern = /Date of cancellation of E-Ticket\/Date of failure of E-Ticket booking:\s*(\d{1,2}-\d{1,2}-\d{2,4})/;
            const refundAmountPattern = /Refund amount:\s*(\d+\.\d+)/;

            const pnrMatch = mailBody.match(pnrPattern);
            const refundDateMatch = mailBody.match(refundDatePattern);
            const refundAmountMatch = mailBody.match(refundAmountPattern);

            if (pnrMatch) ticketInfo['PNR No'] = pnrMatch[1];
            if (refundDateMatch) ticketInfo['Cancelled Date'] = refundDateMatch[1]; // Assuming same as refund date
            if (refundAmountMatch) ticketInfo['Refund Amount'] = refundAmountMatch[1];
            
            ticketInfo.Status = "Refund";
        }
        console.log(ticketInfo);
        
        return ticketInfo;
    },

    async    classifyIrctcEmail(subject) {
        const subjectLower = subject.toLowerCase();
        if (subjectLower.includes('booking') && subjectLower.includes('confirmation')) {
            return 'Booking Confirmation';
        } else if (subjectLower.includes('cancel')) {
            return 'CancelTicket';
        } else if (subjectLower.includes('refund')) {
            return 'Refund';
        } else {
            return 'Unknown';
        }
    },




    // async extractFilpkartOrderInfo(mailBody, classification) {
    //     let ticketInfo = {};


    //     mailBody = await this.cleanMailBody(mailBody);

    //     // console.log(mailBody);z  


    //     if (classification === "") {

            
    //     } else if (classification === "") {
           
    //     }   
    //     else if (classification === "") {

    //     }
        
        
    //     return ticketInfo;
    // },


    async classifyEmail(mailBody) {
        // Convert mailBody to lowercase for easier matching
        mailBody = mailBody.toLowerCase();
        console.log(mailBody)
    
        // Check if the email is an "Order Placed" email
        if (mailBody.includes("order confirmation")) {
            return "Order Placed";
        }
    
        // Check if the email is an "Order Delivery" email
        if (mailBody.includes("shipped") ) {
            return "Order Delivery";
        }
    
        // Check if the email is an "Order Cancellation" email
        if (mailBody.includes("order cancellation")) {
            return "Order Cancellation";
        }
    
        // Check if the email is an "Order Return" email
        if (mailBody.includes("return request")) {
            return "Order Return";
        }
    
        // Check if the email is a "Refund Success" email
        if (mailBody.includes("refund processed")) {
            return "Refund Success";
        }
    
        return "Unknown";
    },
    

    async extractFlipkartOrderInfo(mailBody, classification) {
        let orderInfo = {};
    
        mailBody = await this.cleanMailBody(mailBody);
    
        if (classification === "Order Placed") {
            const orderIdPattern = /Order ID\s*:\s*(\d+)/;
            const orderDatePattern = /Order Date\s*:\s*(\d{2}-\d{2}-\d{4})/;
            const itemPattern = /Product Details:([\s\S]*?)Total Amount/;
            const totalAmountPattern = /Total Amount\s*:\s*Rs\.\s*(\d+\.\d+)/;
            const deliveryPattern = /Shipping Address\s*:\s*([\w\s,]+(?:\d{6})?)/;
    
            const orderIdMatch = mailBody.match(orderIdPattern);
            const orderDateMatch = mailBody.match(orderDatePattern);
            const itemMatch = mailBody.match(itemPattern);
            const totalAmountMatch = mailBody.match(totalAmountPattern);
            const deliveryMatch = mailBody.match(deliveryPattern);
    
            if (orderIdMatch) orderInfo['orderID'] = orderIdMatch[1];
            if (orderDateMatch) orderInfo['orderDate'] = orderDateMatch[1];
            if (itemMatch) orderInfo['productDetails'] = itemMatch[1].trim();
            if (totalAmountMatch) orderInfo['totalAmount'] = totalAmountMatch[1];
            if (deliveryMatch) orderInfo['shippingAddress'] = deliveryMatch[1].trim();
    
            orderInfo.status = "Order Placed";
    
        } else if (classification === "Order Delivery") {
            const orderIdPattern = /Order ID\s*:\s*(\d+)/;
            const deliveryDatePattern = /Delivery Date\s*:\s*(\d{2}-\d{2}-\d{4})/;
            const trackingPattern = /Tracking ID\s*:\s*(\d+)/;
            const courierPattern = /Courier\s*:\s*([\w\s]+)/;
            const deliveryAddressPattern = /Delivered To\s*:\s*([\w\s,]+(?:\d{6})?)/;
    
            const orderIdMatch = mailBody.match(orderIdPattern);
            const deliveryDateMatch = mailBody.match(deliveryDatePattern);
            const trackingMatch = mailBody.match(trackingPattern);
            const courierMatch = mailBody.match(courierPattern);
            const deliveryAddressMatch = mailBody.match(deliveryAddressPattern);
    
            if (orderIdMatch) orderInfo['orderID'] = orderIdMatch[1];
            if (deliveryDateMatch) orderInfo['deliveryDate'] = deliveryDateMatch[1];
            if (trackingMatch) orderInfo['trackingID'] = trackingMatch[1];
            if (courierMatch) orderInfo['Courier'] = courierMatch[1];
            if (deliveryAddressMatch) orderInfo['deliveredTo'] = deliveryAddressMatch[1].trim();
    
            orderInfo.status = "Order Delivered";
    
        } else if (classification === "Order Cancellation") {
            const orderIdPattern = /Order ID\s*:\s*(\d+)/;
            const cancellationDatePattern = /Cancellation Date\s*:\s*(\d{2}-\d{2}-\d{4})/;
            const reasonPattern = /Cancellation Reason\s*:\s*([\w\s]+)/;
            const refundAmountPattern = /Refund Amount\s*:\s*Rs\.\s*(\d+\.\d+)/;
            const refundStatusPattern = /Refund Status\s*:\s*([\w\s]+)/;
    
            const orderIdMatch = mailBody.match(orderIdPattern);
            const cancellationDateMatch = mailBody.match(cancellationDatePattern);
            const reasonMatch = mailBody.match(reasonPattern);
            const refundAmountMatch = mailBody.match(refundAmountPattern);
            const refundStatusMatch = mailBody.match(refundStatusPattern);
    
            if (orderIdMatch) orderInfo['orderID'] = orderIdMatch[1];
            if (cancellationDateMatch) orderInfo['cancellationDate'] = cancellationDateMatch[1];
            if (reasonMatch) orderInfo['cancellationReason'] = reasonMatch[1];
            if (refundAmountMatch) orderInfo['refundAmount'] = refundAmountMatch[1];
            if (refundStatusMatch) orderInfo['refundStatus'] = refundStatusMatch[1];
    
            orderInfo.status = "Order Cancelled";
    
        } else if (classification === "Order Return") {
            const orderIdPattern = /Order ID\s*:\s*(\d+)/;
            const returnDatePattern = /Return Requested\s*:\s*(\d{2}-\d{2}-\d{4})/;
            const returnReasonPattern = /Return Reason\s*:\s*([\w\s]+)/;
            const refundAmountPattern = /Refund Amount\s*:\s*Rs\.\s*(\d+\.\d+)/;
            const returnStatusPattern = /Return Status\s*:\s*([\w\s]+)/;
    
            const orderIdMatch = mailBody.match(orderIdPattern);
            const returnDateMatch = mailBody.match(returnDatePattern);
            const returnReasonMatch = mailBody.match(returnReasonPattern);
            const refundAmountMatch = mailBody.match(refundAmountPattern);
            const returnStatusMatch = mailBody.match(returnStatusPattern);
    
            if (orderIdMatch) orderInfo['orderID'] = orderIdMatch[1];
            if (returnDateMatch) orderInfo['returnRequested'] = returnDateMatch[1];
            if (returnReasonMatch) orderInfo['returnReason'] = returnReasonMatch[1];
            if (refundAmountMatch) orderInfo['refundAmount'] = refundAmountMatch[1];
            if (returnStatusMatch) orderInfo['returnStatus'] = returnStatusMatch[1];


            orderInfo.status = "Order Return In Progress";
    
        } else if (classification === "Refund Success") {
            const orderIdPattern = /Order ID\s*:\s*(\d+)/;
            const refundAmountPattern = /Refund Amount\s*:\s*Rs\.\s*(\d+\.\d+)/;
            const refundDatePattern = /Refund Date\s*:\s*(\d{2}-\d{2}-\d{4})/;
            const refundMethodPattern = /Refund Method\s*:\s*([\w\s]+)/;
            const refundStatusPattern = /Refund Status\s*:\s*([\w\s]+)/;
    
            const orderIdMatch = mailBody.match(orderIdPattern);
            const refundAmountMatch = mailBody.match(refundAmountPattern);
            const refundDateMatch = mailBody.match(refundDatePattern);
            const refundMethodMatch = mailBody.match(refundMethodPattern);
            const refundStatusMatch = mailBody.match(refundStatusPattern);
    
            if (orderIdMatch) orderInfo['orderID'] = orderIdMatch[1];
            if (refundAmountMatch) orderInfo['refundAmount'] = refundAmountMatch[1];
            if (refundDateMatch) orderInfo['refundDate'] = refundDateMatch[1];
            if (refundMethodMatch) orderInfo['refundMethod'] = refundMethodMatch[1];
            if (refundStatusMatch) orderInfo['refundStatus'] = refundStatusMatch[1];
    
            orderInfo.status = "Refund Processed";
    
        }
    
        return orderInfo;
    },
    

    // async    classifyFlipkartEmail(subject) {
    //     const subjectLower = subject.toLowerCase(); 
    // }




}
