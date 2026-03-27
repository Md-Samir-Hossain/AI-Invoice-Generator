import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    id: {type: String, required: true},
    description: {type: String, required: true},
    quantity: {type: Number, required: true, default: 1},
    price: {type: Number, required: true, default: 0},
},{
    _id: false
});

const invoiceSchema = new mongoose.Schema({
    owner: {
        type: String, 
        required: true, 
        index: true
        //it will store the user id from clerk
    },
    // invoice number must be unique for each invoice
    invoiceNumber: {
        type: String, 
        required: true, 
        index: true
    },
    issueDate: {
        type: String, 
        required: true
    },
    dueDate: {
        type: String, 
        default: ""
    },

    //Business Info
    fromBusinessName: {
        type: String, 
        default: ""
    },
    fromAddress: {
        type: String, 
        default: ""
    },
    fromPhone: {
        type: String, 
        default: ""
    },
    fromEmail: {
        type: String, 
        default: ""
    },
    fromGst: {
        type: String, 
        default: ""
    },
    
    // Client Info
    client: {
        name: {type: String, default: ""},
        address: {type: String, default: ""},
        phone: {type: String, default: ""},
        email: {type: String, default: ""},
    },

    currency: { type: String, default: "INR"},
    status: { type: String, enum: ["draft", "unpaid", "paid", "overdue"], default: "draft"},

    // For Assets Handling
    logoDataUrl: { type: String, default: null },
    signatureDataUrl: { type: String, default: null },
    stampDataUrl: { type: String, default: null },

    signatureName: { type: String, default: "" },
    signatureTitle: { type: String, default: "" },

    taxPercent: { type: Number, default: 18 },
    tax: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    items: [itemSchema],
    
},{
    timestamps: true    
});

export const Invoice = mongoose.model("Invoice", invoiceSchema);