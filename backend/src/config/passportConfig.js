const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../models');

passport.use(new LocalStrategy({
  usernameField: 'email', // ou 'login' 
  passwordField: 'senha'
}, async (email, senha, done) => {
  try {
    const usuario = await db.Usuario.findOne({ 
      where: { email },
      include: ['Administrador', 'Vigia']
    });
    
    if (!usuario) {
      return done(null, false, { message: 'Usuário não encontrado' });
    }
    
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return done(null, false, { message: 'Senha incorreta' });
    }
    
    if (!usuario.ativo) {
      return done(null, false, { message: 'Usuário inativo' });
    }
    
    return done(null, usuario);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((usuario, done) => {
  done(null, usuario.idUsuario);
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await db.Usuario.findByPk(id, {
      include: ['Administrador', 'Vigia']
    });
    done(null, usuario);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;