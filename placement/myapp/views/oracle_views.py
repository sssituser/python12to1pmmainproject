import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_oracle_api(request):
    questions_pool = [
        {"id": 1, "question": "What is Oracle Database primarily known as?", "options": ["An Object-Oriented Database", "A Document Store", "A Relational Database Management System", "A Graph Database"], "correct": 2},
        {"id": 2, "question": "Which language is used to query Oracle databases?", "options": ["SQL", "Java", "C++", "Python"], "correct": 0},
        {"id": 3, "question": "Which statement is used to retrieve data from a database?", "options": ["EXTRACT", "SELECT", "GET", "FETCH"], "correct": 1},
        {"id": 4, "question": "Which SQL statement is used to update data in a database?", "options": ["MODIFY", "SAVE", "UPDATE", "CHANGE"], "correct": 2},
        {"id": 5, "question": "Which SQL statement is used to insert new data in a database?", "options": ["ADD RECORD", "INSERT INTO", "ADD NEW", "APPEND"], "correct": 1},
        {"id": 6, "question": "Which SQL statement is used to delete data from a database?", "options": ["DELETE", "REMOVE", "DROP", "CLEAR"], "correct": 0},
        {"id": 7, "question": "What does SQL stand for?", "options": ["Structured Query Language", "Strong Question Language", "Structured Question Language", "Standard Query Logic"], "correct": 0},
        {"id": 8, "question": "With SQL, how do you select a column named \"FirstName\" from a table named \"Persons\"?", "options": ["SELECT Persons.FirstName", "SELECT FirstName FROM Persons", "EXTRACT FirstName FROM Persons", "GET FirstName Persons"], "correct": 1},
        {"id": 9, "question": "With SQL, how do you select all the columns from a table named \"Persons\"?", "options": ["SELECT [all] FROM Persons", "SELECT *.Persons", "SELECT * FROM Persons", "SELECT Persons"], "correct": 2},
        {"id": 10, "question": "With SQL, how do you select all the records from a table named \"Persons\" where the value of the column \"FirstName\" is \"Peter\"?", "options": ["SELECT * FROM Persons WHERE FirstName='Peter'", "SELECT [all] FROM Persons WHERE FirstName LIKE 'Peter'", "SELECT FROM Persons WHERE FirstName='Peter'", "SELECT * FROM Persons IF FirstName='Peter'"], "correct": 0},
        {"id": 11, "question": "With SQL, how do you select all the records from a table named \"Persons\" where the value of the column \"FirstName\" starts with an \"a\"?", "options": ["SELECT * FROM Persons WHERE FirstName LIKE 'a%'", "SELECT * FROM Persons WHERE FirstName LIKE '%a'", "SELECT * FROM Persons WHERE FirstName='a'", "SELECT * FROM Persons WHERE FirstName LIKE '*a*'"], "correct": 0},
        {"id": 12, "question": "The OR operator displays a record if ANY conditions listed are true. The AND operator displays a record if ALL of the conditions listed are true", "options": ["True", "False", "Only AND is true", "Only OR is true"], "correct": 0},
        {"id": 13, "question": "With SQL, how do you select all the records from a table named \"Persons\" where the \"FirstName\" is \"Peter\" and \"LastName\" is \"Jackson\"?", "options": ["SELECT FirstName='Peter', LastName='Jackson' FROM Persons", "SELECT * FROM Persons WHERE FirstName<>'Peter' AND LastName<>'Jackson'", "SELECT * FROM Persons WHERE FirstName='Peter' AND LastName='Jackson'", "SELECT * FROM Persons WHERE FirstName='Peter' OR LastName='Jackson'"], "correct": 2},
        {"id": 14, "question": "With SQL, how do you select all the records from a table named \"Persons\" where the \"LastName\" is alphabetically between (and including) \"Hansen\" and \"Pettersen\"?", "options": ["SELECT * FROM Persons WHERE LastName BETWEEN 'Hansen' AND 'Pettersen'", "SELECT * FROM Persons WHERE LastName>'Hansen' AND LastName<'Pettersen'", "SELECT * FROM Persons WHERE LastName IN ('Hansen', 'Pettersen')", "None of the above"], "correct": 0},
        {"id": 15, "question": "Which SQL statement is used to return only different values?", "options": ["SELECT DIFFERENT", "SELECT UNIQUE", "SELECT DISTINCT", "SELECT ONLY"], "correct": 2},
        {"id": 16, "question": "Which SQL keyword is used to sort the result-set?", "options": ["ORDER BY", "SORT BY", "ORDER", "SORT"], "correct": 0},
        {"id": 17, "question": "With SQL, how can you return all the records from a table named \"Persons\" sorted descending by \"FirstName\"?", "options": ["SELECT * FROM Persons ORDER BY FirstName DESC", "SELECT * FROM Persons SORT BY 'FirstName' DESC", "SELECT * FROM Persons ORDER FirstName DESC", "SELECT * FROM Persons SORT 'FirstName' DESC"], "correct": 0},
        {"id": 18, "question": "What is PL/SQL?", "options": ["Procedural Language extension to SQL", "Previous Level SQL", "Programming Logic SQL", "Practical Language SQL"], "correct": 0},
        {"id": 19, "question": "What command is used to change the structure of a database table?", "options": ["UPDATE TABLE", "ALTER TABLE", "MODIFY TABLE", "CHANGE TABLE"], "correct": 1},
        {"id": 20, "question": "Which operator is used to search for a specified pattern in a column?", "options": ["LIKE", "GET", "MATCH", "SEARCH"], "correct": 0},
        {"id": 21, "question": "What does a LEFT JOIN do?", "options": ["Returns all records from the left table, and the matched records from the right table", "Returns all records from the right table", "Returns only matched records", "Returns cross product of tables"], "correct": 0},
        {"id": 22, "question": "How do you count the number of records in a table named \"Customers\"?", "options": ["SELECT NUMBER(*) FROM Customers", "SELECT SUM(*) FROM Customers", "SELECT COUNT(*) FROM Customers", "SELECT TOTAL(*) FROM Customers"], "correct": 2},
        {"id": 23, "question": "What is the role of the primary key?", "options": ["To link two tables", "To uniquely identify each record in a table", "To store passwords", "To encrypt data"], "correct": 1},
        {"id": 24, "question": "What is a foreign key?", "options": ["A key used outside the database", "A key that links two tables together", "An encrypted key", "A password key"], "correct": 1},
        {"id": 25, "question": "Which function returns the current date and time in Oracle SQL?", "options": ["NOW()", "GETDATE()", "SYSDATE", "CURRENT_TIME()"], "correct": 2},
        {"id": 26, "question": "What statement is used to revoke privileges from a user?", "options": ["DENY", "REMOVE", "REVOKE", "DELETE"], "correct": 2},
        {"id": 27, "question": "Which keyword is used to conditionally execute PL/SQL statements?", "options": ["IF", "CASE", "Both", "None"], "correct": 2},
        {"id": 28, "question": "What command is used to permanently save changes in a transaction?", "options": ["SAVE", "COMMIT", "WRITE", "FLUSH"], "correct": 1},
        {"id": 29, "question": "What happens when you issue a ROLLBACK command?", "options": ["Saves changes", "Undoes all changes made in the current transaction", "Drops the table", "Deletes all tables"], "correct": 1},
        {"id": 30, "question": "What does the TRUNCATE statement do?", "options": ["Deletes the table structure", "Deletes all records but keeps the structure", "Deletes specific records", "Backs up a table"], "correct": 1},
        {"id": 31, "question": "Which function is used to handle NULL values by substituting a specific value if a NULL is encountered?", "options": ["ISNULL", "NVL", "IFNULL", "COALESCE"], "correct": 1},
        {"id": 32, "question": "What is an index used for in Oracle?", "options": ["To enforce constraints", "To speed up data retrieval", "To encrypt tables", "To backup data"], "correct": 1},
        {"id": 33, "question": "Which data type is used to store variable-length character strings up to 4000 bytes?", "options": ["VARCHAR", "VARCHAR2", "CHAR", "TEXT"], "correct": 1},
        {"id": 34, "question": "Which set operator returns distinct rows that are output by both the left and right queries?", "options": ["UNION", "INTERSECT", "MINUS", "JOIN"], "correct": 1},
        {"id": 35, "question": "What is a trigger in Oracle?", "options": ["A scheduled job", "An automatic execution of code when a specified event occurs", "A constraint", "An index"], "correct": 1},
        {"id": 36, "question": "What is a view in a database?", "options": ["A physical table", "A virtual table based on the result of an SQL statement", "A stored procedure", "An index"], "correct": 1},
        {"id": 37, "question": "Which group function calculates the average of values?", "options": ["SUM", "MAX", "MEAN", "AVG"], "correct": 3},
        {"id": 38, "question": "Which SQL clause is used to group rows that have the same values?", "options": ["ORDER BY", "GROUP BY", "AGGREGATE", "COLLECT"], "correct": 1},
        {"id": 39, "question": "What clause is used to filter records after a GROUP BY grouping?", "options": ["WHERE", "HAVING", "FILTER", "SORT"], "correct": 1},
        {"id": 40, "question": "What does ACID stand for in database concepts?", "options": ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Complete, Isolation, Data", "Automated, Consistent, Indexed, Data", "Application, Condition, Index, Database"], "correct": 0},
        {"id": 41, "question": "A cursor in PL/SQL is:", "options": ["A pointer to a memory area that context information", "An index", "A function", "A data type"], "correct": 0},
        {"id": 42, "question": "What is a sequence in Oracle?", "options": ["A list of tables", "An object used to generate unique numbers", "A series of queries", "A loop in PL/SQL"], "correct": 1},
        {"id": 43, "question": "Which command removes a table definition and all its data?", "options": ["TRUNCATE TABLE", "DELETE TABLE", "DROP TABLE", "REMOVE TABLE"], "correct": 2},
        {"id": 44, "question": "Which character function converts all letters of a string to uppercase?", "options": ["UPCAP", "TO_UPPER", "UPPER", "CAPITALIZE"], "correct": 2},
        {"id": 45, "question": "What is the purpose of the BETWEEN operator?", "options": ["To search for a pattern", "To select values within a given range", "To compare null values", "To sort the data"], "correct": 1},
        {"id": 46, "question": "What will be the result of this query?\nSELECT COUNT(*) FROM employees WHERE department_id IS NULL;", "options": ["Counts all employees", "Counts employees without a department", "Returns 0", "Throws an error"], "correct": 1},
        {"id": 47, "question": "What does this Oracle query exactly do?\nSELECT * FROM employees WHERE ROWNUM <= 5;", "options": ["Fetches the top 5 employees by salary", "Fetches the first 5 records retrieved by the database", "Throws a syntax error", "Fetches rows older than 5 days"], "correct": 1},
        {"id": 48, "question": "What will be the output of this query?\nSELECT NVL(NULL, 'Default Data') FROM dual;", "options": ["NULL", "Default Data", "Error", "0"], "correct": 1},
        {"id": 49, "question": "In Oracle, what is the output of the following string query?\nSELECT SUBSTR('Database', 1, 4) FROM dual;", "options": ["Data", "base", "Daba", "atab"], "correct": 0},
        {"id": 50, "question": "What does the following SQL achieve?\nSELECT dept_id, count(*) FROM employees GROUP BY dept_id HAVING count(*) > 5;", "options": ["Returns all departments", "Returns departments with exactly 5 employees", "Returns departments with more than 5 employees", "Returns the top 5 departments"], "correct": 2},
    ]

    theoretical_questions = questions_pool[:45]
    practical_questions = questions_pool[45:50]
    
    selected_questions = random.sample(theoretical_questions, 15) + practical_questions
    random.shuffle(selected_questions)
    
    return Response({
        'success': True,
        'data': selected_questions
    })
