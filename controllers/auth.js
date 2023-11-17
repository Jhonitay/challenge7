const { PrismaClient } = require("@prisma/client"),
  prisma = new PrismaClient(),
  utils = require("../utils/bcrypt");
const nodemailer = require("nodemailer");

module.exports = {
  create: async (req, res) => {
    try {
      const existEmail = await prisma.users.findFirst({
        where: {
          email: req.body.email,
        },
      });
      if (existEmail) {
        return res.status(409).json({
          message: "email alredy exist",
        });
      }
      const data = await prisma.users.create({
        data: {
          username: req.body.username,
          email: req.body.email,
          password: await utils.cryptPassword(req.body.password),
        },
      });
      return res.status(201).json({
        message: "succsess create user",
        data: data,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "internal Server Error",
      });
    }
  },
  resetPassword: async (req, res) => {
    console.log(req.body);

    try {
      const existEmail = await prisma.users.findFirst({
        where: {
          email: req.body.email,
        },
      });
      if (!existEmail) {
        return res.render("error");
      }
      const encrypt = await utils.cryptPassword(req.body.email)

      const data = await prisma.users.update({
        data: {
          resetPasswordToken: encrypt,
        },
        where: {
          id: existEmail.id,
        },
      });
      const transporter = nodemailer.createTransport  ({
        host: 'smtp.gmail.com', 
        port: 465,
        secure: true,
        auth:{
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      })  
      const mailOption = {
        from: 'nextnitay06@gmail.com',
        to : req.body.email,
        subject: 'Reset-Password',
        html: `<p> reset password <a href="localhost:4000/set-password/${encrypt}">click here </a>`
      }
      transporter.sendMail(mailOption,(err) => {
        if(err){
          console.log(err)
          return res.render("error");
        }
        return res.render("success");
      })
      
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: "bbabab",
      });
    }
  },
  setPassword: async (req, res) => {
    console.log(req.body);

    try {
      const existEmail = await prisma.users.findFirst({
        where: {
          resetPasswordToken: req.body.key,
        },
      });
      if (!existEmail) {
        return res.render("error");
      }

      await prisma.users.update({
        data: {
          password: await utils.cryptPassword(req.body.password),
          resetPasswordToken: null,
        },
        where: {
          id: existEmail.id,
        },
      });
      return res.render("success");
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: "bbabab",
      });
    }
  },
};
