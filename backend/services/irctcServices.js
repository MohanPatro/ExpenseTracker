const irctcModel=require('../models/irctcModel');

exports.updateTicketToCanceL=async(updatedStatus, pnr,refundAmount )=>{
    try{
        // const data=await irctcModel.findOne({"PNR No":pnr})
        const updatedTicket = await irctcModel.findOneAndUpdate(
            { "PNR No": pnr },        // Find document by PNR No
            { 
              $set: { 
                Status: updatedStatus,       // Update status
                refundAmount: refundAmount   // Add or update refundAmount field
              }
            },
            { new: true }             // Return the updated document
          );
    }
    catch(error)
    {
        throw new Error(error);
    }
}

