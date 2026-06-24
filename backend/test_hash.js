const bcryptjs = require('bcryptjs');

const hash = '$2a$10$47k51qdjw6GrPpEGA4yUtuFgeP0XO8oZD6.T0wbuguP/0kcy4L7yC';
const candidate = 'kritin006123';

console.log('bcryptjs match:', bcryptjs.compareSync(candidate, hash));

try {
  const bcrypt = require('bcrypt');
  console.log('bcrypt match:', bcrypt.compareSync(candidate, hash));
} catch (e) {
  console.log('bcrypt not installed or failed:', e.message);
}
