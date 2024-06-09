const {authService, userService} = require('../services');
const jwt = require('jsonwebtoken');
const config= require('../config/config');

const loginUser = async (req, res) => {
  const { email, password } = req.body;
    try {
        let user = await userService.getUserByEmail({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.secret_key,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.cookie('token', token, { httpOnly: true });
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
    try {   
        const detail = {
            $or: [
              { username:username },
              { email:email}
            ]
          };
        let user = await userService.getUserByEmail( detail);
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = await authService.createUser({
            username,
            email,
            password
        });

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.secret_key,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.cookie('token', token, { httpOnly: true });
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
  loginUser,
  registerUser,
};