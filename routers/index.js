const express = require('express'),
    router = express.Router(),
    controller = require('../controllers/auth'),
    {user} = require('../models')


router.get('/', (req,res) => {
    return res.render('index')
})
router.get('/reset-password', (req,res) => {
    return res.render('reset-password')
})
router.get('/set-password/:key', async (req,res) => {
    try {
        const findData = await user.findFirst({
            where : {
                resetPasswordToken : req.params.key
            }
        })
        if(!findData){
            return res.render('error')
        }
        return res.render('set-password', {user: findData})
    } catch (error) {
        return res.render('error')
    }
})
router.post('/v1/register', controller.create)
router.post('/v1/reset-password', controller.resetPassword)
router.post('/v1/set-password', controller.setPassword)

module.exports = router   