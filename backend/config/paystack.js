const axios = require('axios');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Get Paystack secret key from environment
const getSecretKey = () => {
  return process.env.PAYSTACK_SECRET_KEY;
};

// Initialize Paystack transaction
const initializeTransaction = async (email, amount, metadata = {}, callbackUrl = null) => {
  try {
    const payload = {
      email,
      amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
      metadata,
      callback_url: callbackUrl
    };

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getSecretKey()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Paystack Initialize Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// Verify Paystack transaction
const verifyTransaction = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${getSecretKey()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Paystack Verify Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// Create transfer recipient (for paying artisans)
const createTransferRecipient = async (name, accountNumber, bankCode, currency = 'NGN') => {
  try {
    const payload = {
      type: 'nuban',
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency
    };

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getSecretKey()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Paystack Create Recipient Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// Initiate transfer to artisan
const initiateTransfer = async (amount, recipient, reason = 'Payment for service') => {
  try {
    const payload = {
      source: 'balance',
      amount: amount * 100, // Convert to kobo
      recipient,
      reason
    };

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getSecretKey()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Paystack Transfer Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// Get list of banks
const getBanks = async () => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/bank?currency=NGN`,
      {
        headers: {
          Authorization: `Bearer ${getSecretKey()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Paystack Get Banks Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// Verify account number
const verifyAccountNumber = async (accountNumber, bankCode) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${getSecretKey()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Paystack Verify Account Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
  createTransferRecipient,
  initiateTransfer,
  getBanks,
  verifyAccountNumber
};
