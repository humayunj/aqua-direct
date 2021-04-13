let pairs = [];

const TARGET = "http://127.0.0.1:3000";
const OPTS = {
  ssl: {
    letsencrypt: {
      email: "support@recrutability.com",
      production: true,
    },
  },
};

function makeURL(username) {
  return `${username}.recrutability.me`;
}

function getDomain(username) {
  for (let p of pairs) {
    if (p[1] === username) {
      return p[0];
    }
  }
  return null;
}

function getUsername(domain) {
  for (let p of pairs) {
    if (p[0] === domain) {
      return p[1];
    }
  }
  return null;
}
function push(domain, username) {
  let d;
  if ((d = getDomain(username))) {
    removeDomain(d);
  }
  pairs.push([domain, username]);

  this.register(domain, "http://127.0.0.1:3000",OPTS);
}

function removeDomain(domain) {
  let u = getUsername(domain);
  let i = pairs.findIndex((p, i) => p[0] == domain);
  pairs.splice(i, 1);
  console.log(pairs);
  console.log(domain, u);
  this.unregister(domain, TARGET);
}
var CustomDomainsResolver = function (host, url, req) {
  let u = getUsername(host);
  if (u) {
    req.headers.host = makeURL(u);
    req.headers['X-CUSTOM-DOMAIN'] = host;
    return {
      url: "http://127.0.0.1:3000",
    };
  }
};
CustomDomainsResolver.priority = -1;

function store(proxy) {
  proxy.addResolver(CustomDomainsResolver);

  return {
    getDomain,
    push: push.bind(proxy),
    removeDomain: removeDomain.bind(proxy),
  };
}

module.exports = store;
