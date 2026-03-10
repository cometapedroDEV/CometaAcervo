'use server';

/**
 * @fileOverview Server actions for Pushin Pay API integration.
 */

const API_URL = "https://api.pushinpay.com.br/api/pix/cashIn";

export async function generatePixAction(amountInReais: number, token: string) {
  if (!token) throw new Error("Token da Pushin Pay não configurado.");

  // Converte para centavos
  const valueCentavos = Math.round(amountInReais * 100);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        value: valueCentavos,
        webhook_url: "https://seudominio.com/webhook/pushinpay" // Placeholder
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro PushinPay:", errorData);
      throw new Error("Falha ao gerar PIX");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na action generatePix:", error);
    throw error;
  }
}

export async function checkPixStatusAction(transactionId: string, token: string) {
  const url = `https://api.pushinpay.com.br/api/transactions/${transactionId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      cache: 'no-store'
    });

    if (!response.ok) return { status: 'error' };

    const data = await response.json();
    return { status: data.status }; // 'paid', 'pending', etc.
  } catch (error) {
    return { status: 'error' };
  }
}
