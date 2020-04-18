const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const storeController = require('../controllers/storeController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
//***STORES ROUTES****
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));


router.get('/add', 
  authController.isLoggedIn, 
  storeController.addStore
);

router.post('/add', 
  storeController.upload, 
  catchErrors(storeController.resize), 
  catchErrors(storeController.createStore)
);

router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize), 
  catchErrors(storeController.createStore)
);

// STORES EDIT ROUTE
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
// STORES FIND BY SLUG ROUTE
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

// STORES TAG ROUTES
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

//****LOGIN ROUTES*****
router.get('/login', userController.loginForm);
router.post('/login', authController.login);


// REGISTER ROUTE
router.get('/register', userController.registerForm);

router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/account', 
  authController.isLoggedIn, 
  userController.account
);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));

router.post('/account/reset/:token', 
  authController.confirmedPasswords,
  catchErrors(authController.update)
);


// LOGOUT ROUTE
router.get('/logout', authController.logout);

//MAP ROUTE
router.get('/map', storeController.mapPage);

//HEART STORES ROUTE
router.get('/hearts', 
  authController.isLoggedIn, 
  catchErrors(storeController.getHearts)
);
router.post('/reviews/:id', 
  authController.isLoggedIn, 
  catchErrors(reviewController.addReview)
);

//TOP STORES ROUTE
router.get('/top', catchErrors(storeController.getTopStores));

// *****API******
router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));

module.exports = router;
