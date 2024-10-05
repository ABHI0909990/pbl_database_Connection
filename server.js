const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 2930;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/Virual_Learn', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.once('open', () => {
    console.log("Mongoose connection successful");
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email_id: {
        type: String,
        required: true
    },
    pass_word: {
        type: String,
        required: true
    }
});

const Users = mongoose.model("Users", userSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'LogIN_&_SignIN.html'));
});

app.post('/register', async (req, res) => {
    const { name, email_id, pass_word } = req.body;
    const user = new Users({ name, email_id, pass_word });
    
    const existingUser = await Users.findOne({ email_id: user.email_id });
    if (existingUser) {
        res.sendFile(path.join(__dirname, 'LogIN_&_SignIN.html'));
    } else {
        await user.save();
        console.log(user);
        res.sendFile(path.join(__dirname, 'create_join.html'));
    }
});

app.post('/login', async (req, res) => {
    const user = await Users.findOne({ email_id: req.body.email_id });
    if (Users.pass_word === req.body.pass_word) {
        res.sendFile(path.join(__dirname, 'create_join.html'));
    } else {
        res.send("Wrong Password");
    }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
