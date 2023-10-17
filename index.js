const inquirer = require('inquirer');
const mysql = require('mysql2/promise');

let connection;

// Function to fetch choices for inquirer prompts from the database
async function fetchInquirerChoices(query, nameKey, valueKey) {
  const [rows] = await connection.query(query);
  return rows.map(row => ({ name: row[nameKey], value: row[valueKey] }));
}

// Function to execute a query and display the result as a table
async function queryAndDisplayTable(query) {
  const [rows] = await connection.query(query);
  console.table(rows);
}

// Function to add a department to the database
async function addDepartment() {
  const departmentChoices = await fetchInquirerChoices('SELECT * FROM department', 'name', 'id');
  
  // Prompt for department details
  const { title, salary, department_id } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'What is the name of the role?' },
    { type: 'input', name: 'salary', message: 'What is the salary of the role?' },
    { type: 'list', name: 'department_id', message: 'Which department does this role belong to?', choices: departmentChoices },
  ]);

  // Insert department data into the database
  await connection.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, department_id]);
  console.log(`Added ${title} to the database.`);
}

// Function to add a role to the database
async function addRole() {
  // Fetch existing department choices
  const departmentChoices = await fetchInquirerChoices('SELECT * FROM department', 'name', 'id');
  
  // Prompt for role details
  const role = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'What is the name of the role?' },
    { type: 'input', name: 'salary', message: 'What is the salary of the role?' },
    { type: 'list', name: 'department_id', message: 'Which department does the role belong to?', choices: departmentChoices }
  ]);

  // Insert role data into the database
  await connection.query('INSERT INTO role SET ?', role);
  console.log(`Added ${role.title} to the database`);
}

// Function to add an employee to the database
async function addEmployee() {
  const roleChoices = await fetchInquirerChoices('SELECT * FROM role', 'title', 'id');
  const managerChoices = await fetchInquirerChoices('SELECT * FROM employee', 'first_name', 'id');
  
  // Prompt for employee details
  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    { type: 'input', name: 'first_name', message: "What is the employee's first name?" },
    { type: 'input', name: 'last_name', message: "What is the employee's last name?" },
    { type: 'list', name: 'role_id', message: "What is the employee's role?", choices: roleChoices },
    { type: 'list', name: 'manager_id', message: "Who is the employee's manager?", choices: managerChoices }
  ]);

  // Insert employee data into the database
  await connection.query('INSERT INTO employee SET ?', { first_name, last_name, role_id, manager_id });
  console.log(`Added ${first_name} ${last_name} to the database.`);
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

// Function to update an employee's role
async function updateEmployeeRole() {
// Fetch choices for employees and roles
  const employeeChoices = await fetchInquirerChoices('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', 'name', 'id');
  const roleChoices = await fetchInquirerChoices('SELECT id, title FROM role', 'title', 'id');
  
  // Prompt for employee and new role selection
  const { employee_id, new_role_id } = await inquirer.prompt([
    { type: 'list', name: 'employee_id', message: 'Choose the employee to update:', choices: employeeChoices },
    { type: 'list', name: 'new_role_id', message: 'Choose the new role:', choices: roleChoices },
  ]);

  // Update the employee's role in the database
  await connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [new_role_id, employee_id]);
  console.log(`Employee role updated.`);
}

async function updateEmployeeManager() {
  const employeeChoices = await fetchInquirerChoices('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', 'name', 'id');
  const managerChoices = await fetchInquirerChoices('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', 'name', 'id');

  const { employee_id, new_manager_id } = await inquirer.prompt([
    { type: 'list', name: 'employee_id', message: 'Choose the employee whose manager you want to update:', choices: employeeChoices },
    { type: 'list', name: 'new_manager_id', message: 'Choose the new manager for this employee:', choices: managerChoices },
  ]);

  await connection.query('UPDATE employee SET manager_id = ? WHERE id = ?', [new_manager_id, employee_id]);
  console.log(`Employee's manager updated.`);
}

async function deleteDepartment() {
  const departmentChoices = await fetchInquirerChoices('SELECT * FROM department', 'name', 'id');

  const { department_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Which department would you like to delete?',
      choices: departmentChoices,
    },
  ]);

  await connection.query('DELETE FROM department WHERE id = ?', [department_id]);
  console.log(`Department deleted.`);
}

async function deleteRole() {
  const roleChoices = await fetchInquirerChoices('SELECT * FROM role', 'title', 'id');

  const { role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'role_id',
      message: 'Which role would you like to delete?',
      choices: roleChoices,
    },
  ]);

  await connection.query('DELETE FROM role WHERE id = ?', [role_id]);
  console.log(`Role deleted.`);
}

async function deleteEmployee() {
  const employeeChoices = await fetchInquirerChoices('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', 'name', 'id');

  const { employee_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Which employee would you like to delete?',
      choices: employeeChoices,
    },
  ]);

  await connection.query('DELETE FROM employee WHERE id = ?', [employee_id]);
  console.log(`Employee deleted.`);
}

async function viewBudgetByDepartment() {
  const departmentChoices = await fetchInquirerChoices('SELECT * FROM department', 'name', 'id');

  const { department_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Which department\'s budget would you like to view?',
      choices: departmentChoices,
    },
  ]);

  const [rows] = await connection.query(`
    SELECT d.name AS Department, SUM(r.salary) AS 'Utilized Budget'
    FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON r.department_id = d.id
    WHERE d.id = ?
    GROUP BY d.id
  `, [department_id]);

  console.table(rows);
}

async function viewEmployeesByManager() {
  const managerChoices = await fetchInquirerChoices('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', 'name', 'id');
  
  const { manager_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'manager_id',
      message: 'Select a manager to view their employees:',
      choices: managerChoices,
    },
  ]);

  const [rows] = await connection.query(`
    SELECT e.id, e.first_name, e.last_name, r.title 
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    WHERE e.manager_id = ?
  `, [manager_id]);
  
  console.table(rows);
}

async function viewEmployeesByDepartment() {
  const departmentChoices = await fetchInquirerChoices('SELECT * FROM department', 'name', 'id');
  
  const { department_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'department_id',
      message: 'Select a department to view its employees:',
      choices: departmentChoices,
    },
  ]);

  const [rows] = await connection.query(`
    SELECT e.id, e.first_name, e.last_name, r.title 
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    WHERE d.id = ?
  `, [department_id]);
  
  console.table(rows);
}

async function viewAllDepartments() {
  await queryAndDisplayTable('SELECT * FROM department');
}

async function viewAllRoles() {
  await queryAndDisplayTable('SELECT * FROM role');
}

async function viewAllEmployees() {
  await queryAndDisplayTable(`
    SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id
  `);
}

// Main menu function to handle user choices
async function mainMenu() {
  const { action } = await inquirer.prompt([
    // Prompt for user action selection
    // (List of options for various actions)
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'View Employees by Manager',
        'View Employees by Department',
        'View Utilized Budget by Department',
        'Add a Department',
        'Add a Role',
        'Add an Employee',
        'Update an Employee Role',
        'Update an Employee Manager',
        'Delete a Department',
        'Delete a Role',
        'Delete an Employee',
        'Exit',
      ],
    },
  ]);

  switch (action) {
  // Handle different actions based on user choice
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
    case 'View Employees by Manager':
      await viewEmployeesByManager();
      break;
    case 'View Employees by Department':
      await viewEmployeesByDepartment();
      break;
    case 'View Utilized Budget by Department':
      await viewBudgetByDepartment();
      break;
    case 'Add a Department':
      await addDepartment();
      break;
    case 'Update an Employee Role':
      await updateEmployeeRole();
      break;
    case 'Update an Employee Manager': // <-- Insert this new case here
      await updateEmployeeManager();
      break;
    case 'Delete a Department':
      await deleteDepartment();
      break;
    case 'Delete a Role':
      await deleteRole();
      break;
    case 'Delete an Employee':
      await deleteEmployee();
      break;
    case 'Exit':
      connection.end();
      return;
  }

  mainMenu(); // Loop back to the menu
}

// Main function to start the application
async function main() {
  try {
    connection = await mysql.createConnection({
      // Database connection details
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

main(); // Start the main function