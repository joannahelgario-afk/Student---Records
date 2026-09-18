const fs = require("fs");

// Read students.json
const data = fs.readFileSync("students.json", "utf8");
const students = JSON.parse(data);


// 1. Get the average grade of a student
function getAverageGrade(student) {
    if (!student || !Array.isArray(student.grades) || student.grades.length === 0) {
        return 0;
    }

    return student.grades.reduce((sum, grade) => sum + grade, 0)
        / student.grades.length;
}


// 2. Get the top N students
function getTopStudents(students, n) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    if (!Number.isInteger(n) || n < 0) {
        throw new Error("n must be a non-negative integer.");
    }

    // filter() - remove invalid student records
    const validStudents = students.filter(student =>
        student && typeof student.name === "string"
    );

    // map() - create new student objects with average grades
    return validStudents
        .map(student => ({
            ...student,
            averageGrade: getAverageGrade(student)
        }))
        // sort() - highest average first
        .sort((a, b) => b.averageGrade - a.averageGrade)
        .slice(0, n);
}


// 3. Group students by course
function groupByCourse(students) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    return students.reduce((groups, student) => {
        const course = student.course;

        if (!groups[course]) {
            groups[course] = [];
        }

        groups[course].push({ ...student });

        return groups;
    }, {});
}


// 4. Get enrolled and not enrolled count
function getEnrolledCount(students) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    return students.reduce(
        (count, student) => {
            if (student.enrolled === true) {
                count.enrolled++;
            } else {
                count.notEnrolled++;
            }

            return count;
        },
        {
            enrolled: 0,
            notEnrolled: 0
        }
    );
}


// 5. Find a student by name
function findStudent(students, name) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    if (typeof name !== "string") {
        throw new Error("Name must be a string.");
    }

    const searchName = name.trim().toLowerCase();

    return students.find(student =>
        student.name.toLowerCase() === searchName
    ) || null;
}


// 6. Get average grade for each course
function getCourseAverages(students) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    const grouped = groupByCourse(students);

    return Object.entries(grouped)
        .map(([course, courseStudents]) => {
            const allGrades = courseStudents.flatMap(
                student => student.grades || []
            );

            const average = allGrades.length > 0
                ? allGrades.reduce((sum, grade) => sum + grade, 0)
                    / allGrades.length
                : 0;

            return {
                course: course,
                averageGrade: average
            };
        })
        .sort((a, b) => b.averageGrade - a.averageGrade);
}


// 7. Export summary
function exportSummary(students) {
    if (!Array.isArray(students)) {
        throw new Error("Students must be an array.");
    }

    const allGrades = students.flatMap(
        student => student.grades || []
    );

    const overallAverage = allGrades.length > 0
        ? allGrades.reduce((sum, grade) => sum + grade, 0)
            / allGrades.length
        : 0;

    const topStudents = getTopStudents(students, 1);

    return {
        totalStudents: students.length,

        overallAverageGrade: overallAverage,

        topPerformingStudent: topStudents.length > 0
            ? {
                name: topStudents[0].name,
                averageGrade: topStudents[0].averageGrade
            }
            : null,

        breakdownByCourse: getCourseAverages(students)
    };
}


// MAIN FUNCTION
function main() {

    console.log("==========================================");
    console.log("       STUDENT RECORDS DATA REPORT");
    console.log("==========================================");


    // Total student count
    console.log("\n--- TOTAL STUDENTS ---");
    console.log(`Total Students: ${students.length}`);


    // Enrollment count
    console.log("\n--- ENROLLMENT STATUS ---");

    const enrollment = getEnrolledCount(students);

    console.log(`Enrolled: ${enrollment.enrolled}`);
    console.log(`Not Enrolled: ${enrollment.notEnrolled}`);


    // Top students
    console.log("\n--- TOP-PERFORMING STUDENTS ---");

    const topStudents = getTopStudents(students, 3);

    if (topStudents.length === 0) {
        console.log("No students available.");
    } else {
        topStudents.forEach((student, index) => {
            console.log(
                `${index + 1}. ${student.name} - ` +
                `${student.averageGrade.toFixed(2)}`
            );
        });
    }


    // Group by course
    console.log("\n--- STUDENTS GROUPED BY COURSE ---");

    const grouped = groupByCourse(students);

    Object.entries(grouped).forEach(([course, courseStudents]) => {
        console.log(`\n${course}:`);

        courseStudents.forEach(student => {
            console.log(`  - ${student.name}`);
        });
    });


    // Find student
    console.log("\n--- FIND STUDENT ---");

    const searchName = "Joannah Elgario";
    const foundStudent = findStudent(students, searchName);

    if (foundStudent) {
        console.log(`Found: ${foundStudent.name}`);
        console.log(`Course: ${foundStudent.course}`);
        console.log(`Year: ${foundStudent.year}`);
        console.log(`Enrolled: ${foundStudent.enrolled}`);
    } else {
        console.log("Student not found.");
    }


    // Course averages
    console.log("\n--- AVERAGE GRADE BY COURSE ---");

    const courseAverages = getCourseAverages(students);

    if (courseAverages.length === 0) {
        console.log("No course data available.");
    } else {
        courseAverages.forEach(course => {
            console.log(
                `${course.course}: ${course.averageGrade.toFixed(2)}`
            );
        });
    }


    // Summary
    console.log("\n--- SUMMARY ---");

    const summary = exportSummary(students);

    console.log(`Total Students: ${summary.totalStudents}`);

    console.log(
        `Overall Average Grade: ` +
        `${summary.overallAverageGrade.toFixed(2)}`
    );

    if (summary.topPerformingStudent) {
        console.log(
            `Top-Performing Student: ` +
            `${summary.topPerformingStudent.name} ` +
            `(${summary.topPerformingStudent.averageGrade.toFixed(2)})`
        );
    } else {
        console.log("Top-Performing Student: None");
    }


    // Export summary to report.json
    fs.writeFileSync(
        "report.json",
        JSON.stringify(summary, null, 2)
    );

    console.log("\n--- REPORT EXPORTED ---");
    console.log("Summary saved to report.json");

    console.log("\n==========================================");
    console.log("             END OF REPORT");
    console.log("==========================================");
}


// Run the program
main();
