import {conf} from '@/conf';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

// Static files
app.use(express.static(path.join(__dirname, '../../public')));

app.use(bodyParser.json());
if (conf.express.cors) {
  app.use(cors());
}

// Page routes
app.get('/', function(req, res) {
  res.render('index', {title: 'Home'});
});

app.get('/login', function(req, res) {
  res.render('login', {title: 'Login'});
});

app.get('/register', function(req, res) {
  res.render('register', {title: 'Register'});
});

app.get('/dashboard', function(req, res) {
  res.render('dashboard', {title: 'Dashboard'});
});

app.get('/npc-search', function(req, res) {
  res.render('npc-search', {title: 'NPC Search'});
});

app.get('/account', function(req, res) {
  res.render('account', {title: 'Account Settings'});
});

app.get('/profile', function(req, res) {
  res.render('profile', {title: 'Profile Editor'});
});

// API endpoint for realmlist - requires auth token
app.get('/api/connection-info', function(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({error: 'Not authenticated'});
  }

  try {
    const {conf: appConf} = require('@/conf');
    const jsonwebtoken = require('jsonwebtoken');
    jsonwebtoken.verify(token, appConf.secret);
    res.json({realmlist: appConf.realmlistHost || ''});
  } catch (e) {
    return res.status(401).json({error: 'Invalid token'});
  }
});

export {app};
