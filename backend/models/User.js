const userSchema = new Schema({
    username: String,
    password: String,
  });
  
  userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    user.password = await bcrypt.hash(user.password, 10);
    next();
  });
  
  userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };
  
  module.exports = mongoose.model('User', userSchema);