const parse = require("csv-parse/lib/sync");

var fs = require("fs");

let pairs = [];
const TARGET = "http://10.122.0.2:3000";

const OPTS = {
  ssl: {
    // redirect: true,
    letsencrypt: {
      email: "support@recrutability.com",
      production: false,
    },
  },
};

function loadPairs(_push) {
  const records = parse(fs.readFileSync("store.csv", "utf8"), {
    skip_empty_lines: true,
  });

  pairs = records;

  for (let p of pairs) {
    if (p[0] && p[1]) _push(p[0], p[1]);
  }
}

function removeExisting(domain, username) {
  return pairs.filter(
    ([_domain, _username]) => _domain !== domain && _username !== username
  );
}

function addPair(domain, username) {
  pairs = removeExisting(domain, username);
  pairs.push([domain, username]);
  fs.appendFile("store.json", domain + "," + username + "\n", (err) =>
    console.error(err)
  );
}
function removePair(domain, username) {
  pairs = removeExisting(domain, username);
  let s = "";
  for (let p of pairs) {
    s = p[0] + "," + p[1] + "\n";
  }
  fs.writeFile("store.csv", s, (err) => console.error(err));
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
  addPair(domain, username);
  this.register(domain, TARGET, OPTS);
}

function removeDomain(domain) {
  let u = getUsername(domain);
  if (!u) return;
  removePair(domain, u);
  this.unregister(domain, TARGET);
}
var CustomDomainsResolver = function (host, url, req) {
  // if (req.protocol === "http")
  //   // http protocol? redbird will redirect
  //   return url;

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
  let _push = push.bind(proxy);
  return {
    getDomain,
    push: (domain, username) => {
      if (getDomain(username)) {
        return console.warn("Domain " + domain + " already registered");
      }
      _push(domain, username);
    },
    removeDomain: removeDomain.bind(proxy),
  };
}

module.exports = store;
