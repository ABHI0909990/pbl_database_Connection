const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 2930;

const app = express();

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/Virual_Learn', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.once('open', () => {
    console.log("Mongoose connection successful");
});
db.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email_id: {
        type: String,
        required: true,
        unique: true
    },
    pass_word: {
        type: String,
        required: true
    }
});

const Users = mongoose.model("User", userSchema);

const GroupSchema = new mongoose.Schema({
    groupName: { type: String, required: true, unique: true },
    leaderName: { type: String, required: true, unique:true },
    joinCode: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
});

const Group = mongoose.model('Group', GroupSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'LogIN_&_SignIN.html'));
});

app.post('/register', async (req, res) => {
    const { name, email_id, pass_word } = req.body;

    if (!name || !email_id || !pass_word) {
        return res.status(400).send("All fields are required.");
    }

    try {
        const existingUser = await Users.findOne({ email_id });
        if (existingUser) {
            return res.status(400).send("User already exists. Please login.");
        }

        const user = new Users({ name, email_id, pass_word });
        await user.save();
        console.log("Registered User:", user);
        res.sendFile(path.join(__dirname, 'create_join.html'));
    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).send("Server Error");
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
app.post('/create-group', async (req, res) => {
    const { groupName, leaderName } = req.body;

    if (!groupName || !leaderName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let joinCode;
    let isUnique = false;

    while (!isUnique) {
        joinCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existingGroup = await Group.findOne({ joinCode });
        if (!existingGroup) {
            isUnique = true;
        }
    }
    try {
        const existingGroup = await Group.findOne({ groupName });
        if (existingGroup) {
            return res.status(400).json({ error: 'Group name already exists' });
        }

        const newGroup = new Group({
            groupName,
            leaderName,
            joinCode
        });

        const group = await newGroup.save();
        res.status(201).json(group);
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: 'Error creating group' });
    }
});

app.post('/join-group', async (req, res) => {
    const { join_group, join_code } = req.body;

    if (!join_group || !join_code) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const group = await Group.findOne({ groupName: join_group, joinCode: join_code });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        await group.save();
        res.status(200).json({ message: 'Successfully joined group', group });
    } catch (error) {
        console.error("Error joining group:", error);
        res.status(500).json({ error: 'Error joining group' });
    }
});

app.get('/create_join', (req, res) => {
    res.sendFile(path.join(__dirname, 'create_join.html'));
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
