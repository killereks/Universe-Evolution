var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/killereks/Universe-Evolution', // Update to point to your repository  
        user: {
            name: 'Oskar', // update to use your name
            email: 'Your Email address' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)