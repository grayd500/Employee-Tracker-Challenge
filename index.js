const inquirer = require('inquirer');
const mysql = require('mysql2/promise');

let connection;

async function viewAllDepartments() {
  const [rows] = await connection.query('SELECT * FROM department');
  console.table(rows);
}

async function addRole() {
  const departments = await connection.query('SELECT * FROM department');
  const departmentChoices = departments[0].map(({ id, name }) => ({
    name: name,
    value: id
  }));

  const role = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'What is the name of the role?'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'What is the salary of the role?'
    },
    {
      type: 'list',
      name: 'department_id',
      message: 'Which department does the role belong to?',
      choices: departmentChoices
    }
  ]);

  await connection.query('INSERT INTO role SET ?', role);
  console.log(`Added ${role.title} to the database`);
}

// Implement addRole, addEmployee, and updateEmployeeRole later
async function addRole() {}
async function addEmployee() {}
async function updateEmployeeRole() {}

async function addEmployee() {
  // Get roles
  const [roles] = await connection.query('SELECT * FROM role');
  const roleChoices = roles.map(({ id, title, salary, department_id }) => ({
    name: `${title} (${salary})`,
    value: { id, salary, department_id }
  }));

  // Get managers (all employees for now)
  const [managers] = await connection.query('SELECT * FROM employee');
  const managerChoices = managers.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  // Collect employee information
  const { first_name, last_name, roleData, manager_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: "What is the employee's first name?"
    },
    {
      type: 'input',
      name: 'last_name',
      message: "What is the employee's last name?"
    },
    {
      type: 'list',
      name: 'roleData',
      message: "What is the employee's role?",
      choices: roleChoices
    },
    {
      type: 'list',
      name: 'manager_id',
      message: "Who is the employee's manager?",
      choices: managerChoices
    }
  ]);

  const newEmployee = {
    first_name,
    last_name,
    role_id: roleData.id,
    manager_id
  };

  // Insert new employee
  await connection.query('INSERT INTO employee SET ?', newEmployee);
  console.log(`Added ${first_name} ${last_name} as a ${roles.find(role => role.id === roleData.id).title}.`);
}

// Don't forget to call this function where appropriate in your mainMenu() switch statement


async function viewAllRoles() {
  const [rows] = await connection.query('SELECT * FROM role');
  console.table(rows);
}

async function viewAllEmployees() {
  const [rows] = await connection.query('SELECT * FROM employee');
  console.table(rows);
}

async function addDepartment() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the department name:',
    },
  ]);

  await connection.query('INSERT INTO department (name) VALUES (?)', [name]);
  console.log(`${name} department added.`);
}

async function updateEmployeeRole() {
  const employees = await connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
  const employeeChoices = employees[0].map((employee) => ({
    name: employee.name,
    value: employee.id,
  }));

  const roles = await connection.query('SELECT id, title FROM role');
  const roleChoices = roles[0].map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const { employee_id, new_role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Choose the employee to update:',
      choices: employeeChoices,
    },
    {
      type: 'list',
      name: 'new_role_id',
      message: 'Choose the new role:',
      choices: roleChoices,
    },
  ]);

  await connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [new_role_id, employee_id]);
  console.log(`Employee role updated.`);
}

async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a Department',
        'Add a Role',
        'Add an Employee',
        'Update an Employee Role',
        'Exit',
      ],
    },
  ]);

  switch (action) {
    case 'Add a Role':
      await addRole();
      break;
    case 'Add an Employee':
      await addEmployee();
      break;
    case 'View All Departments':
      await viewAllDepartments();
      break;
    case 'View All Roles':
      await viewAllRoles();
      break;
    case 'View All Employees':
      await viewAllEmployees();
      break;
    case 'Add a Department':
      await addDepartment();
      break;
    case 'Update an Employee Role':
      await updateEmployeeRole();
      break;
    case 'Exit':
      connection.end();
      return;
  }

  mainMenu(); // Loop back to the menu
}

async function main() {
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Fr33github', // Make sure to secure your passwords!
      database: 'employee_db',
    });

    mainMenu(); // Start the app
  } catch (err) {
    console.error('MySQL could not connect:', err);
  }
}

main();
