create table uni( name varchar, 
prof_per_stud float, job_after_degree float, languages_classes boolean, age_prof integer,
cit_prof integer, total_cit integer, annual_funding integer, laboratories integer,
avg_income integer, internet_speeed float, pop_density integer, english_knownledge float, PRIMARY KEY(name));

create table faculties( uni_name varchar, name varchar, 
prof_per_stud float, job_after_degree float, languages_classes boolean, age_prof integer,
cit_prof integer, total_cit integer, annual_funding integer, laboratories integer,
avg_income integer, internet_speeed float, pop_density integer, english_knownledge float,
PRIMARY KEY(uni_name,name),
FOREIGN KEY(uni_name) REFERENCES uni(name));
