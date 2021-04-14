var fs = require("fs");

let pairs = [];
const TARGET = "http://10.122.0.2:3000";

const OPTS = {
  ssl: {
    redirect:true,
    letsencrypt: {
      email: "support@recrutability.com",
      production: true,
    },
  },
};

function loadPairs(_push) {
  var store = JSON.parse(fs.readFileSync("store.json", "utf8"));
  for (let pair of store.pairs) {
    _push(pair.domain, pair.username);
  }
}

function makeURL(username) {
  return `${username}.recrutability.com`;
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

  this.register(domain, TARGET, OPTS);
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
    req.headers["X-CUSTOM-DOMAIN"] = host;
    return {
      url: TARGET,
    };
  }
};
CustomDomainsResolver.priority = 1;

function store(proxy) {
  proxy.addResolver(CustomDomainsResolver);
  loadPairs(push.bind(proxy));

  return {
    getDomain,
    push: push.bind(proxy),
    removeDomain: removeDomain.bind(proxy),
  };
}

module.exports = store;
