const express = require("express")
const router = express.Router()
const kiteController = require("../controllers/kiteController")

// Kite Connect routes
router.get("/login", kiteController.login)
router.get("/kite-redirect", kiteController.kiteCallback)
router.get("/profile", kiteController.getProfile)
router.get("/holdings", kiteController.getHoldings)
router.get("/margins/:segment?", kiteController.getMargins)
router.post("/logout", kiteController.logout)

module.exports = router
