export async function sendEmail({ to, subject, text, html }) {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, text, html })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}
