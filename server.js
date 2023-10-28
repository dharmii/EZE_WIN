const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
var path = require('path');
var hbs = require('hbs');
const fileUpload = require('express-fileupload');

var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');

const connectDatabase = require("./config/DBconnect.js");

const frontendRouter = require("./Routes/frontendRoute.js");

const userRouter = require("./Routes/userRoute.js");
const paymentRouter = require("./Routes/paymentRoute.js");
const adminAuthRouter = require("./Routes/adminAuthRoute.js");
const adminRouter = require("./Routes/adminRoute.js");
const QuizRouter = require("./Routes/QuizRouter.js");
const apiRouter = require("./Routes/apiRoute.js");
const { isUnAuthenticated, isAuthenticated } = require('./middleware/authMiddleware');
const auth = require('./middleware/authMiddlewares');

// Connection to the Database
connectDatabase();

const app = express();

app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 6000000000 }}));
app.use(flash());
app.use(fileUpload());


app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/',express.static(path.join(process.cwd(), 'public')));
app.use('/admin',express.static(path.join(process.cwd(), 'public')));
app.use('/admin-auth',express.static(path.join(process.cwd(), 'public')));
app.use('/admin/question',express.static(path.join(process.cwd(), 'public')));
app.use('/admin/contest',express.static(path.join(process.cwd(), 'public')));
hbs.registerPartials(path.join(process.cwd(), 'views/partials'));

hbs.registerHelper("i", function(value)
{
    return parseInt(value) + 1;
});
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper("diffForHumans", function(value)
{
    return value.toLocaleString();
});

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(function(req, res, next){
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});

//Frontend
app.use("/",frontendRouter);

//Admin guest
app.use("/admin-auth",isUnAuthenticated,adminAuthRouter);

//Admin
app.use("/admin",adminRouter);


// ROUTES
app.use("/guest-api", apiRouter);
app.use("/api", auth, apiRouter);
app.use("/apis", apiRouter);
app.use("/quiz",QuizRouter);

// PAYMENT ROUTES
app.use("/api/payment", paymentRouter);

app.listen(process.env.PORT, async () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});