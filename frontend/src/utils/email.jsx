const welcomeEmailTemplate = (name, tempPassword, email) => `
<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <div style="background-color: #2563eb; color: white; display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 20px;">
      Inventory Portal
    </div>
  </div>
  <h2 style="color: #1e293b;">Welcome to the Team, ${name}!</h2>
  <p style="color: #475569; line-height: 1.6;">Your account has been created. To get started, please log in to the inventory management system using the temporary credentials below:</p>
  
  <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px dashed #cbd5e1;">
    <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
    <p style="margin: 5px 0;"><strong>Temp Password:</strong> <code style="background: #e2e8f0; padding: 2px 5px; border-radius: 4px;">${tempPassword}</code></p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.FRONTEND_URL}/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Login & Secure Your Account</a>
  </div>

  <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
    <strong>Security Note:</strong> You will be required to change this password immediately after your first login. This link and temporary password will expire soon.
  </p>
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
  <p style="color: #94a3b8; font-size: 12px; text-align: center;">
    If you didn't expect this email, please contact your IT Administrator.
  </p>
</div>
`;