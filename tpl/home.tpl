<!DOCTYPE html>
	<html>
		<head>
			<title>UniItalia Info</title>
			<meta charset="UTF-8">
			<link rel="stylesheet" href="/styles/home.css"> 
		</head>
		<body>
			<h1 >Italian universities information</h1><h3><a href="/noscript">home</a></h3>
			<h2 style="display:(:showNames ~ none:)">Your lack of javascript is disturbing, but feel free to select a university to display information about it.</h2>
			
			<!-- div to display a list of universities, the display thing to show/hide it had to be done since the if construct wasn't working properly with the bind library -->
			<div style="display:(:showNames ~ none:)">
				(:names ~
				<h3><a href="/noscript?uni=[:name:]">[:name:]</a></h3>
				:)
			</div>

			<!-- div to display stats of a univerity, the display thing to show/hide it had to be done since the if construct wasn't working properly with the bind library -->
			<div style="display:(:showUni ~ none:)">
				(:uni ~
				<h3>[:name:]</h3>
				<h3>average teacher age: [:age_prof:]</h3>
				<h3>professors/students ratio: [:prof_per_stud:]</h3>
				<h3>job after 3 months: [:job_after_degree:]</h3>
				<h3>classes in english: [:languages_classes:]</h3>
				<h3>average citations per teacher: [:cit_prof:]</h3>
				<h3>total citations: [:total_cit:]</h3>
				<h3>annual funding(€): [:annual_funding:]</h3>
				<h3>laboratories: [:laboratories:]</h3>
				<h3>average income(€,yearly): [:avg_income:]</h3>
				<h3>average internet speed(Mb/s): [:internet_speeed:]</h3>
				<h3>population density(people/km2): [:pop_density:]</h3>
				<h3>% of fluent english speakers: [:english_knownledge:]</h3>
				:)
			</div>
			
		</body>
	</html>

