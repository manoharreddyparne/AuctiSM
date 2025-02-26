// /backend/config/config.js
module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://parnemanoharreddy19:Pandu1919@auctismc1.91ca1.mongodb.net/?retryWrites=true&w=majority&appName=AuctiSMC1',
  JWT_SECRET: process.env.JWT_SECRET || 'AuctiSM_Secret_Key_2025_Secure_Token',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'AuctiSM_Refresh_Secret_Key_2025'
};
