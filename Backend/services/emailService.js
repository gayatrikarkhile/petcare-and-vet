const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD exists:", !!process.env.EMAIL_PASSWORD);
console.log("EMAIL_PASSWORD length:", process.env.EMAIL_PASSWORD?.length);


const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASSWORD

    }

});


const sendOTPEmail = async (
    email,
    otp,
    name
) => {

    const mailOptions = {

        from: `"PawSync" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: "PawSync Email Verification OTP",

        html: `

            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                background: #f5f9f8;
            ">

                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    text-align: center;
                ">

                    <h1 style="
                        color: #168875;
                        margin-bottom: 10px;
                    ">
                        🐾 PawSync
                    </h1>


                    <h2>
                        Verify Your Email
                    </h2>


                    <p style="
                        color: #64748b;
                    ">
                        Hello ${name},
                    </p>


                    <p style="
                        color: #64748b;
                    ">
                        Use the following OTP to verify
                        your email address.
                    </p>


                    <div style="
                        margin: 25px 0;
                        padding: 15px;
                        background: #e7f6f1;
                        border-radius: 10px;
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #168875;
                    ">
                        ${otp}
                    </div>


                    <p style="
                        color: #64748b;
                        font-size: 13px;
                    ">
                        This OTP will expire in
                        <strong>10 minutes</strong>.
                    </p>


                    <p style="
                        color: #94a3b8;
                        font-size: 11px;
                        margin-top: 25px;
                    ">
                        If you did not create a PawSync
                        account, you can safely ignore this email.
                    </p>

                </div>

            </div>

        `

    };


    await transporter.sendMail(
        mailOptions
    );

};


module.exports = {
    sendOTPEmail
};