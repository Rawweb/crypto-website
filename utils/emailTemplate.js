const emailSuccesfulTemplate = username => `
  <div style="background:#f5f7fb; padding:40px;">
    <div style="
      max-width:600px;
      margin:auto;
      background:#ffffff;
      padding:30px;
      border-radius:10px;
      font-family:Arial, sans-serif;
      box-shadow:0 4px 12px rgba(0,0,0,0.08);
    ">

      <div style="text-align:center; margin-bottom:20px;">
        <img src="cid:logo" alt="RawCrypto Logo" style="height:45px;" />
      </div>

      <h2 style="color:#111827; text-align:center;">
        Email Verified Successfully
      </h2>

      <p style="color:#374151; font-size:15px;">
        Hello ${username || 'there'},
      </p>

      <p style="color:#4b5563; font-size:15px; line-height:1.6;">
        Great news! Your email has been successfully verified.  
        Your RawCrypto account is now fully activated and ready to use.
      </p>

      <p style="color:#4b5563; font-size:15px; margin-top:20px;">
        You can now log in and start exploring secure crypto investment tools, portfolio tracking, and more!
      </p>

      <div style="text-align:center; margin-top:30px;">
        <a href="https://rawcrypto.com/login"
        style="
          background:#2563eb;
          padding:12px 25px;
          color:white;
          text-decoration:none;
          border-radius:8px;
          font-weight:bold;
          display:inline-block;
        ">Login Now</a>
      </div>
    </div>

     <!-- FOOTER -->
      <div style="text-align: center; margin-top: 15px; padding-top: 20px;">
        <p style="font-size:13px; color:#091242; font-weight:bold; margin:0;">
          RawCrypto
          <span style="color:#6c7280; font-weight:normal;"> — Your Gateway to Secure Crypto Growth.</span>
        </p>

        <p style="font-size:13px; color:#6c7280; margin:6px 0 0;">
          Question or concerns? Reach us at 
          <a href="mailto:${process.env.ADMIN_EMAIL}" 
             style="color:#091242; text-decoration:none; font-weight:bold;">
             ${process.env.ADMIN_EMAIL}
          </a>
        </p>

        <p style="font-size:13px; color:#6c7280; margin:6px 0;">
          Follow us on 
          <span style="color:#091242; font-weight:bold;">Instagram</span>, 
          <span style="color:#091242; font-weight:bold;">Facebook</span>, 
          <span style="color:#091242; font-weight:bold;">LinkedIn</span>
        </p>

        <p style="font-size:13px; color:#6c7280; margin:6px 0;">
          Don’t want more emails from us? 
          <a href="https://rawexpress.com/unsubscribe" style="color:#dc2626; font-weight:bold;">
            Unsubscribe
          </a>
        </p>

        <p style="font-size:12px; color:#aaa; margin-top:18px;">
          © ${new Date().getFullYear()} RawExpress. All rights reserved.
        </p>
      </div>
  </div>
`;

const passwordSuccessfulTemplate = username => `
  <div style="background:#f5f7fb; padding:40px;">
    <div style="
      max-width:600px;
      margin:auto;
      background:#ffffff;
      padding:30px;
      border-radius:10px;
      font-family:Arial, sans-serif;
      box-shadow:0 4px 12px rgba(0,0,0,0.08);
    ">

      <div style="text-align:center; margin-bottom:20px;">
        <img src="cid:logo" alt="RawCrypto Logo" style="height:45px;" />
      </div>

      <h2 style="color:#111827; text-align:center;">
        Password Reset Successful
      </h2>

      <p style="color:#374151; font-size:15px;">
        Hello ${username || 'there'},
      </p>

      <p style="color:#4b5563; font-size:15px; line-height:1.6;">
        Great news! Your password has been successfully reset.  
        You can now use your new password to log in to your RawCrypto account.
      </p>

      <p style="color:#4b5563; font-size:15px; margin-top:20px;">
        You can now log in and start exploring secure crypto investment tools, portfolio tracking, and more!
      </p>

      <div style="text-align:center; margin-top:30px;">
        <a href="https://rawcrypto.com/login"
        style="
          background:#2563eb;
          padding:12px 25px;
          color:white;
          text-decoration:none;
          border-radius:8px;
          font-weight:bold;
          display:inline-block;
        ">Login Now</a>
      </div>
    </div>

     <!-- FOOTER -->
      <div style="text-align: center; margin-top: 15px; padding-top: 20px;">
        <p style="font-size:13px; color:#091242; font-weight:bold; margin:0;">
          RawCrypto
          <span style="color:#6c7280; font-weight:normal;"> — Your Gateway to Secure Crypto Growth.</span>
        </p>

        <p style="font-size:13px; color:#6c7280; margin:6px 0 0;">
          Question or concerns? Reach us at 
          <a href="mailto:${process.env.ADMIN_EMAIL}" 
             style="color:#091242; text-decoration:none; font-weight:bold;">
             ${process.env.ADMIN_EMAIL}
          </a>
        </p>

        <p style="font-size:13px; color:#6c7280; margin:6px 0;">
          Follow us on 
          <span style="color:#091242; font-weight:bold;">Instagram</span>, 
          <span style="color:#091242; font-weight:bold;">Facebook</span>, 
          <span style="color:#091242; font-weight:bold;">LinkedIn</span>
        </p>

        <p style="font-size:13px; color:#6c7280; margin:6px 0;">
          Don’t want more emails from us? 
          <a href="https://rawexpress.com/unsubscribe" style="color:#dc2626; font-weight:bold;">
            Unsubscribe
          </a>
        </p>

        <p style="font-size:12px; color:#aaa; margin-top:18px;">
          © ${new Date().getFullYear()} RawExpress. All rights reserved.
        </p>
      </div>
  </div>
`;

const notificationEmailTemplate = (username, title, content) => {
  return `
  <div style="background:#f5f7fb;padding:40px 0;">
    <div style="
      max-width:600px;
      margin:auto;
      background:#ffffff;
      border-radius:10px;
      padding:30px;
      font-family:Arial, sans-serif;
      box-shadow:0 4px 12px rgba(0,0,0,0.08);
    ">

      <!-- LOGO -->
      <div style="margin-bottom:25px;">
        <img src="cid:logo" style="height:45px;" alt="RawCrypto Logo" />
      </div>

      <!-- TITLE -->
      <h2 style="color:#111827;margin-bottom:10px;">
        ${title}
      </h2>

      <!-- GREETING -->
      <p style="font-size:15px;color:#374151;">
        Hello ${username || 'there'},
      </p>

      <!-- MESSAGE BODY -->
      <div style="
        font-size:15px;
        color:#4b5563;
        line-height:1.6;
        margin-top:15px;
      ">
        ${content}
      </div>

      <!-- CTA (optional placeholder) -->
      <div style="margin-top:30px;">
        <a href="${process.env.CLIENT_URL}"
          style="
            display:inline-block;
            padding:12px 22px;
            background:#091242;
            color:#ffffff;
            border-radius:6px;
            text-decoration:none;
            font-size:14px;
            font-weight:bold;
          ">
          Go to Dashboard
        </a>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;margin-top:20px;">
      <p style="font-size:13px;color:#091242;font-weight:bold;margin:0;">
        RawCrypto
        <span style="color:#6c7280;font-weight:normal;">
          — Your Gateway to Secure Crypto Growth.
        </span>
      </p>

      <p style="font-size:12px;color:#6c7280;margin-top:6px;">
        Need help? Contact us at
        <a href="mailto:${process.env.ADMIN_EMAIL}"
           style="color:#091242;font-weight:bold;text-decoration:none;">
          ${process.env.ADMIN_EMAIL}
        </a>
      </p>

      <p style="font-size:12px;color:#aaa;margin-top:15px;">
        © ${new Date().getFullYear()} RawCrypto. All rights reserved.
      </p>
    </div>
  </div>
  `;
};




module.exports = {
  emailSuccesfulTemplate,
  passwordSuccessfulTemplate,
  notificationEmailTemplate,
}
