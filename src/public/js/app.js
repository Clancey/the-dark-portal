// The Dark Portal - Client JavaScript

const API_URL = '/graphql';

// Token management
const Auth = {
  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  isLoggedIn() {
    return !!this.getToken();
  },
};

// GraphQL API helper
/**
 * @param query
 * @param variables
 */
async function graphql(query, variables = {}) {
  const token = Auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({query, variables}),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

// GraphQL object wrapper for convenience
const GraphQL = {
  async query(query, variables = {}) {
    const token = Auth.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({query, variables}),
    });

    return await response.json();
  },
};

// UI Helpers
/**
 * @param elementId
 * @param message
 * @param type
 */
function showAlert(elementId, message, type = 'error') {
  const alert = document.getElementById(elementId);
  if (alert) {
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
  }
}

/**
 * @param elementId
 */
function hideAlert(elementId) {
  const alert = document.getElementById(elementId);
  if (alert) {
    alert.className = 'alert';
  }
}

/**
 * @param button
 * @param loading
 */
function setLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="spinner"></span> Loading...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
  }
}

// Account Creation
/**
 * @param event
 */
async function handleRegister(event) {
  event.preventDefault();

  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const username = form.querySelector('#username').value.trim();
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value;
  const confirmPassword = form.querySelector('#confirmPassword').value;
  const inviteCode = form.querySelector('#inviteCode').value.trim();

  hideAlert('registerAlert');

  // Validation
  if (password !== confirmPassword) {
    showAlert('registerAlert', 'Passwords do not match');
    return;
  }

  if (password.length < 6) {
    showAlert('registerAlert', 'Password must be at least 6 characters');
    return;
  }

  setLoading(button, true);

  try {
    const query = `
      mutation NewAccount($input: default_auth_newAccountInput!) {
        default_auth_newAccount(newAccountInput: $input) {
          id
          token
        }
      }
    `;

    const data = await graphql(query, {
      input: {username, email, password, inviteCode},
    });

    Auth.setToken(data.default_auth_newAccount.token);
    Auth.setUser({id: data.default_auth_newAccount.id, username, email});

    showAlert('registerAlert', 'Account created successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  } catch (error) {
    showAlert('registerAlert', error.message || 'Registration failed. Please try again.');
  } finally {
    setLoading(button, false);
  }
}

// Login
/**
 * @param event
 */
async function handleLogin(event) {
  event.preventDefault();

  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const username = form.querySelector('#username').value.trim();
  const password = form.querySelector('#password').value;

  hideAlert('loginAlert');
  setLoading(button, true);

  try {
    const query = `
      mutation Authorize($input: default_auth_loginInput!) {
        default_auth_authorize(loginInput: $input) {
          id
          token
          email
          gmlevel
        }
      }
    `;

    const data = await graphql(query, {
      input: {username, password},
    });

    const result = data.default_auth_authorize;
    Auth.setToken(result.token);
    Auth.setUser({
      id: result.id,
      username,
      email: result.email,
      gmlevel: result.gmlevel,
    });

    window.location.href = '/dashboard';
  } catch (error) {
    showAlert('loginAlert', error.message || 'Login failed. Please check your credentials.');
  } finally {
    setLoading(button, false);
  }
}

// NPC Search
/**
 * @param event
 */
async function handleNpcSearch(event) {
  event.preventDefault();

  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const name = form.querySelector('#npcName').value.trim();
  const resultsContainer = document.getElementById('npcResults');

  if (!name) {
    showAlert('searchAlert', 'Please enter an NPC name to search');
    return;
  }

  hideAlert('searchAlert');
  setLoading(button, true);
  resultsContainer.innerHTML = '<div class="loading"><span class="spinner"></span> Searching...</div>';

  try {
    const query = `
      query SearchNpcs($input: default_world_searchNpcsInput!) {
        default_world_searchNpcs(searchNpcsInput: $input) {
          entry
          name
          subname
          minlevel
          maxlevel
          rank
          type
          locations {
            guid
            map
            zoneId
            areaId
            position_x
            position_y
            position_z
          }
        }
      }
    `;

    const data = await graphql(query, {
      input: {name, limit: 50},
    });

    const npcs = data.default_world_searchNpcs;

    if (!npcs || npcs.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <p>No NPCs found matching "${name}"</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = npcs.map((npc, index) => `
      <div class="npc-card">
        <div class="npc-header">
          <div>
            <div class="npc-name">${escapeHtml(npc.name)}</div>
            ${npc.subname ? `<div class="npc-subname">&lt;${escapeHtml(npc.subname)}&gt;</div>` : ''}
          </div>
          <span class="npc-entry">Entry: ${npc.entry}</span>
        </div>
        <div class="npc-info">
          <span>Level: ${npc.minlevel}${npc.maxlevel !== npc.minlevel ? '-' + npc.maxlevel : ''}</span>
          <span>Rank: ${getRankName(npc.rank)}</span>
          <span>Type: ${getTypeName(npc.type)}</span>
        </div>
        ${npc.locations && npc.locations.length > 0 ? `
          <button class="locations-toggle" onclick="toggleLocations(${index})">
            Show ${npc.locations.length} spawn location(s)
          </button>
          <div class="locations-list" id="locations-${index}">
            ${npc.locations.map((loc) => `
              <div class="location-item">
                Map: ${loc.map} | Zone: ${loc.zoneId} | Area: ${loc.areaId}<br>
                X: ${loc.position_x.toFixed(2)}, Y: ${loc.position_y.toFixed(2)}, Z: ${loc.position_z.toFixed(2)}
              </div>
            `).join('')}
          </div>
        ` : '<div class="text-muted">No spawn locations found</div>'}
      </div>
    `).join('');
  } catch (error) {
    showAlert('searchAlert', error.message || 'Search failed. Please try again.');
    resultsContainer.innerHTML = '';
  } finally {
    setLoading(button, false);
  }
}

/**
 * @param index
 */
function toggleLocations(index) {
  const list = document.getElementById(`locations-${index}`);
  if (list) {
    list.classList.toggle('show');
    const button = list.previousElementSibling;
    if (list.classList.contains('show')) {
      button.textContent = button.textContent.replace('Show', 'Hide');
    } else {
      button.textContent = button.textContent.replace('Hide', 'Show');
    }
  }
}

/**
 * @param rank
 */
function getRankName(rank) {
  const ranks = ['Normal', 'Elite', 'Rare Elite', 'Boss', 'Rare'];
  return ranks[rank] || 'Unknown';
}

/**
 * @param type
 */
function getTypeName(type) {
  const types = [
    'None', 'Beast', 'Dragonkin', 'Demon', 'Elemental', 'Giant',
    'Undead', 'Humanoid', 'Critter', 'Mechanical', 'Not specified',
    'Totem', 'Non-combat Pet', 'Gas Cloud',
  ];
  return types[type] || 'Unknown';
}

/**
 * @param text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Password Change
/**
 * @param event
 */
async function handlePasswordChange(event) {
  event.preventDefault();

  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const oldPass = form.querySelector('#oldPassword').value;
  const newPass = form.querySelector('#newPassword').value;
  const confirmPass = form.querySelector('#confirmPassword').value;

  hideAlert('passwordAlert');

  if (newPass !== confirmPass) {
    showAlert('passwordAlert', 'New passwords do not match');
    return;
  }

  if (newPass.length < 6) {
    showAlert('passwordAlert', 'New password must be at least 6 characters');
    return;
  }

  setLoading(button, true);

  try {
    const query = `
      mutation ChangePassword($input: default_auth_changePswInput!) {
        default_auth_changePassword(changePswInput: $input) {
          message
        }
      }
    `;

    await graphql(query, {
      input: {oldPass, newPass},
    });

    showAlert('passwordAlert', 'Password changed successfully!', 'success');
    form.reset();
  } catch (error) {
    showAlert('passwordAlert', error.message || 'Failed to change password');
  } finally {
    setLoading(button, false);
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Update nav based on auth state
  const navUser = document.getElementById('navUser');
  const navGuest = document.getElementById('navGuest');

  if (Auth.isLoggedIn()) {
    if (navUser) navUser.style.display = 'flex';
    if (navGuest) navGuest.style.display = 'none';

    const userNameEl = document.getElementById('userName');
    const user = Auth.getUser();
    if (userNameEl && user) {
      userNameEl.textContent = user.username;
    }
  } else {
    if (navUser) navUser.style.display = 'none';
    if (navGuest) navGuest.style.display = 'flex';
  }

  // Attach form handlers
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  const npcSearchForm = document.getElementById('npcSearchForm');
  if (npcSearchForm) {
    npcSearchForm.addEventListener('submit', handleNpcSearch);
  }

  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordChange);
  }

  // Load realmlist on dashboard
  const realmlistEl = document.getElementById('realmlistCode');
  if (realmlistEl && Auth.isLoggedIn()) {
    fetch('/api/connection-info', {
      headers: {'Authorization': 'Bearer ' + Auth.getToken()},
    })
        .then((r) => r.json())
        .then((data) => {
          if (data.realmlist) {
            realmlistEl.textContent = 'set realmlist ' + data.realmlist;
          } else {
            realmlistEl.textContent = 'Realmlist not configured';
          }
        })
        .catch(() => {
          realmlistEl.textContent = 'Unable to load realmlist';
        });
  }

  // Logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
    });
  }
});
