import https from 'https';

const apiStatusURL =
  'https://api.netlify.com/api/v1/sites/4620cb4c-3705-45a8-bd78-ce43087deafd/deploys';
const netlifyDeployURL = 'https://app.netlify.com/sites/warisin/deploys';
const commitHash = process.env.GITHUB_SHA;
const startTime = Date.now();
const timeout = 3 * 60 * 1000;
const interval = 10 * 1000;

console.log('Check the build status in netlify: ' + netlifyDeployURL);
(async () => {
  let deployID;
  while (true) {
    await sleep(interval);
    try {
      let deploy;
      if (deployID) {
        deploy = await getNetlifyAPI(`${apiStatusURL}/${deployID}`);
      } else {
        const deploys = await getNetlifyAPI(apiStatusURL);
        for (let i = 0; i < Math.min(10, deploys.length); i++) {
          const d = deploys[i];
          if (d.commit_ref === commitHash) {
            deploy = d;
            deployID = d.id;
            break;
          }
        }
      }
      checkDeploy(deploy);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
    if (Date.now() - startTime > timeout) {
      console.error('Timeout', timeout, 'ms reached');
      process.exit(1);
    }
  }
})();

function checkDeploy(deploy) {
  if (!deploy) {
    console.log('Waiting for netlify build to start...');
    return;
  }
  console.log('Netlify build status:', deploy.state);
  switch (deploy.state) {
    case 'error':
      throw new Error('Build error');
    case 'ready':
      process.exit(0);
  }
}

function getNetlifyAPI(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            let json = JSON.parse(body);
            resolve(json);
          } catch (error) {
            console.error(error.message);
            reject(err);
          }
        });
      })
      .on('error', (error) => {
        console.error(error.message);
        reject(err);
      });
  });
}

async function sleep(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
