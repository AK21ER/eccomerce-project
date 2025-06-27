import { mailTrapClient,sender } from "./mailtrap.config.js";
import { purchase_verification } from "./emailTemplate.js";

export const emailSender = async (user,products,total) =>{
    // const recipients =[{email:user.email}] // to be edited when there is a wifi
    const productRows = products.map(p => `
  <tr>
    <td>${p.product}</td>
    <td>${p.quantity}</td>
    <td>$${p.totalmoney}</td>
    <td>${p.coupon}</td>
  </tr>
`).join('');
    try {
        const client= await mailTrapClient.send({
    from: sender,
    to: [{ email: "itsmereka21@gmail.com" }] ,
    subject: "purchase verification!",
    html:purchase_verification .replace("{username}",user.name)
                               .replace("{useremail}",user.email)
                               .replace("{productRows}",productRows)
                               .replace("{totalmoney}" , total)

    
  })
  console.log("email send successfully")

  return {"message":"email sended"}
    } catch (error) {
           console.log("error ocured in email sending",error)
        return {"message":"error occured in email sending","error":error};
     
    }



}



export const sendVerificationEmail = async (user, code) => {
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Hello ${user.name},</h2>
        <p>To verify your purchase, please use the following code:</p>
        <h3 style="color: #4caf50;">${code}</h3>
        <p>This code will expire in 10 minutes.</p>
        <p>Thanks,<br>Your E-commerce Team</p>
      </body>
    </html>
  `;

  try {
    await mailTrapClient.send({
      from: sender,
      to: [{ email: user.email }],
      subject: "Your Purchase Verification Code",
      html: htmlContent,
    });

    console.log("Verification email sent to customer.");
    return { message: "Verification email sent." };
  } catch (error) {
    console.error("Error sending verification email", error);
    return { message: "Error sending verification email", error };
  }
};
