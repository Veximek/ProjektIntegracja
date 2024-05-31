const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.send('User registered');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).send('Invalid credentials');
  }
  const token = jwt.sign({ userId: user._id }, 'SECRET_KEY');
  res.json({ token });
});

router.get('/profile', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const payload = jwt.verify(token, 'SECRET_KEY');
  const user = await User.findById(payload.userId);
  res.json(user);
});

module.exports = router;