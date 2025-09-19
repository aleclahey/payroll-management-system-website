DROP DATABASE IF EXISTS AlecLaheyPayroll;
CREATE DATABASE AlecLaheyPayroll;
USE AlecLaheyPayroll;

CREATE TABLE Department (
    DepartmentID INT AUTO_INCREMENT NOT NULL,
    DepartmentName VARCHAR(50) NOT NULL,
    DepartmentDesc VARCHAR(150) NOT NULL DEFAULT 'Dept. Desc to be determined',
    PRIMARY KEY (DepartmentID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE EmployeePosition (
    EmployeePositionID INT AUTO_INCREMENT NOT NULL,
    Title VARCHAR(60),
    FromDate DATE,
    ToDate DATE,
    PRIMARY KEY (EmployeePositionID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE AddressType (
    AddressTypeID INT AUTO_INCREMENT NOT NULL,
    TypeName VARCHAR(50) NOT NULL,
    TypeDescription VARCHAR(150) NOT NULL,
    PRIMARY KEY (AddressTypeID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE AddressInfo (
    AddressInfoID INT AUTO_INCREMENT NOT NULL,
    Street VARCHAR(100) NOT NULL,
    City VARCHAR(50) NOT NULL,
    Province VARCHAR(50) NOT NULL,
    PostalCode VARCHAR(20) NOT NULL,
    Country VARCHAR(50) NOT NULL,
    AddressTypeID INT NOT NULL,
    PRIMARY KEY (AddressInfoID),
    FOREIGN KEY (AddressTypeID) REFERENCES AddressType(AddressTypeID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Employee (
    EmployeeID INT AUTO_INCREMENT NOT NULL,
    FirstName VARCHAR(60) NOT NULL,
    LastName VARCHAR(70) NOT NULL,
    Gender CHAR(1) NOT NULL,
    HireDate DATE,
    ManagerEmployeeID INT,
    DepartmentID INT,
    EmployeePositionID INT,
    AddressInfoID INT,
    LastUpdated DATE NOT NULL,
    PRIMARY KEY (EmployeeID),
    FOREIGN KEY (ManagerEmployeeID) REFERENCES Employee(EmployeeID),
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID),
    FOREIGN KEY (EmployeePositionID) REFERENCES EmployeePosition(EmployeePositionID),
    FOREIGN KEY (AddressInfoID) REFERENCES AddressInfo(AddressInfoID),
    CHECK (Gender IN ('M','F','X'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE EmployeeAddress (
    EmployeeAddressID INT AUTO_INCREMENT NOT NULL,
    EmployeeID INT NOT NULL,
    AddressInfoID INT NOT NULL,
    PRIMARY KEY (EmployeeAddressID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID),
    FOREIGN KEY (AddressInfoID) REFERENCES AddressInfo(AddressInfoID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE PayrollMonth (
    PayrollMonthID INT AUTO_INCREMENT NOT NULL,
    PayrollMonth VARCHAR(20),
    PRIMARY KEY (PayrollMonthID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Deductions (
    DeductionsID INT AUTO_INCREMENT NOT NULL,
    DeductionType VARCHAR(60) NOT NULL,
    DeductionAmount DECIMAL(10,2),
    PRIMARY KEY (DeductionsID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE HourlyEmployee (
    HourlyEmployeeID INT AUTO_INCREMENT NOT NULL,
    EmployeeID INT NOT NULL,
    PayrollMonthID INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE,
    HourlyRate FLOAT NOT NULL,
    DeductionID INT NOT NULL,
    PRIMARY KEY (HourlyEmployeeID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID),
    FOREIGN KEY (PayrollMonthID) REFERENCES PayrollMonth(PayrollMonthID),
    FOREIGN KEY (DeductionID) REFERENCES Deductions(DeductionsID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE SalariedEmployee (
    SalariedEmployeeID INT AUTO_INCREMENT NOT NULL,
    EmployeeID INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE,
    SalaryAmount DECIMAL(10,2),
    BonusAmount DECIMAL(10,2),
    DeductionID INT NOT NULL,
    PRIMARY KEY (SalariedEmployeeID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID),
    FOREIGN KEY (DeductionID) REFERENCES Deductions(DeductionsID),
    CHECK (SalaryAmount >= 0),
    CHECK (BonusAmount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Benefits (
    BenefitsID INT AUTO_INCREMENT NOT NULL,
    EmployeeID INT NOT NULL,
    BenefitPlan VARCHAR(60) NOT NULL,
    PRIMARY KEY (BenefitsID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE TimeSheet (
    TimeSheetID INT AUTO_INCREMENT NOT NULL,
    EmployeeID INT NOT NULL,
    ClockIn TIME,
    ClockOut TIME,
    PRIMARY KEY (TimeSheetID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE PersonalDays (
    PersonalDaysID INT AUTO_INCREMENT NOT NULL,
    EmployeeID INT NOT NULL,
    PDType VARCHAR(60) NOT NULL,
    Paid BOOLEAN NOT NULL,
    DaysOff FLOAT NOT NULL,
    PRIMARY KEY (PersonalDaysID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE BankInformation (
    BankInformationID INT AUTO_INCREMENT NOT NULL,
    EmployeeID INT NOT NULL,
    BankInstitution VARCHAR(100) NOT NULL,
    InstitutionNumber CHAR(3) NOT NULL,
    AccountNumber CHAR(10) NOT NULL,
    TransitNumber CHAR(5) NOT NULL,
    PRIMARY KEY (BankInformationID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE HoursWorked (
    HoursWorkedID INT AUTO_INCREMENT NOT NULL,
    PayrollMonthID INT NOT NULL,
    DaysWorked INT,
    HoursWorked FLOAT,
    OvertimeHours FLOAT,
    PRIMARY KEY (HoursWorkedID),
    FOREIGN KEY (PayrollMonthID) REFERENCES PayrollMonth(PayrollMonthID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Payments (
    PaymentsID INT AUTO_INCREMENT NOT NULL,
    EmployeeID INT NOT NULL,
    PayrollMonthID INT NOT NULL,
    OvertimePay DECIMAL(10,2),
    DeductionsID INT NOT NULL,
    HourlyEmployeeID INT,
    SalariedEmployeeID INT,
    PRIMARY KEY (PaymentsID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID),
    FOREIGN KEY (PayrollMonthID) REFERENCES PayrollMonth(PayrollMonthID),
    FOREIGN KEY (DeductionsID) REFERENCES Deductions(DeductionsID),
    FOREIGN KEY (HourlyEmployeeID) REFERENCES HourlyEmployee(HourlyEmployeeID),
    FOREIGN KEY (SalariedEmployeeID) REFERENCES SalariedEmployee(SalariedEmployeeID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
