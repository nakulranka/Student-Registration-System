create database DBMS;
use DBMS;

CREATE TABLE student_information (
    roll_no VARCHAR(20) PRIMARY KEY NOT NULL,
    stud_name VARCHAR(50),
    aadhar_no VARCHAR(12) UNIQUE NOT NULL,
    phone_no VARCHAR(10),
    email VARCHAR(50),
    address VARCHAR(100),
    abc VARCHAR(20),
    blood_group VARCHAR(3)
);
drop table semester_registration; 
CREATE TABLE receipt (
    roll_no VARCHAR(20) NOT NULL UNIQUE KEY,
    receipt_pdf LONGBLOB NOT NULL,
    FOREIGN KEY (roll_no) REFERENCES student_information(roll_no)
);

select * from student_information;
select * from semester_registration;
select * from receipt;
select * from undertakings;

CREATE TABLE semester_registration (
    roll_no VARCHAR(20) NOT NULL UNIQUE KEY,
    semester INT NOT NULL,
    FOREIGN KEY (roll_no) REFERENCES student_information(roll_no)
);
    
CREATE TABLE undertakings (
	roll_no VARCHAR(20) NOT NULL UNIQUE KEY,
    scholarship LONGBLOB NOT NULL,
    aadhar LONGBLOB NOT NULL,
    antiragging LONGBLOB NOT NULL,
    abc LONGBLOB NOT NULL,
    FOREIGN KEY (roll_no) REFERENCES student_information(roll_no)
);






