export const baseEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PlasmaCare</title>
  <style>
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #000000; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { 
      background-color: #b97A56; 
      padding: 20px; 
      text-align: center; 
      border-radius: 8px 8px 0 0;
    }
    .content { 
      background-color: #FFFFFF; 
      padding: 30px; 
      border-radius: 0 0 8px 8px;
    }
    .button {
      background-color: #b97A56;
      color: white !important;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      display: inline-block;
    }
    h1, h2 { color: #b97A56; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: white; margin: 0; font-family: 'Inter', sans-serif;">PlasmaCare</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      ${new Date().getFullYear()} PlasmaCare. Tous droits réservés.
    </div>
  </div>
</body>
</html>
`;

export const appointmentConfirmationTemplate = (appointment) => baseEmailTemplate(`
  <h2>Confirmation de rendez-vous</h2>
  <p>Bonjour,</p>
  <p>Votre rendez-vous du <strong>${new Date(appointment.date).toLocaleDateString('fr-FR')}</strong> à <strong>${appointment.time}</strong> a été confirmé.</p>
  <p>Type: ${appointment.type}</p>
  ${appointment.notes ? `<p>Notes: ${appointment.notes}</p>` : ''}
  <p style="text-align: center; margin-top: 30px;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/appointments" class="button">Voir mes rendez-vous</a>
  </p>
`);

export const passwordResetTemplate = (resetLink) => baseEmailTemplate(`
  <h2>Réinitialisation de mot de passe</h2>
  <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
  </p>
  <p>Ce lien expirera dans 24 heures. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
`);

export const notificationTemplate = (title, message, actionUrl, actionText) => baseEmailTemplate(`
  <h2>${title}</h2>
  <p>${message}</p>
  ${actionUrl ? `
  <p style="text-align: center; margin-top: 30px;">
    <a href="${actionUrl}" class="button">${actionText || 'Voir détails'}</a>
  </p>
  ` : ''}
`);
