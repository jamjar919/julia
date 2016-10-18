function complexNum(real, imaginary) {
	this.real = real;
	this.imaginary = imaginary;
	return this;
}

function addComplex(c1, c2) {
	var real = c1.real + c2.real;
	var imaginary = c1.imaginary + c2.imaginary;
	return new complexNum(real,imaginary);
}

function multComplex(c1, c2) {
	var real = (c1.real * c2.real) - (c1.imaginary * c2.imaginary);
	var imaginary = (c1.real * c2.imaginary) + (c2.real * c1.imaginary);
	return new complexNum(real,imaginary);
}

function absComplex(c) {
	return new complexNum(Math.abs(c.real),Math.abs(c.imaginary));
}

function dispComplex(c) {
	var sign = '';
	if (c.imaginary >= 0) {
		sign = '+';
	}
	return Math.floor(c.real*1000)/1000 + sign + Math.floor(c.imaginary*1000)/1000 + "i";
}

function getComplexModulus(c) {
	return Math.sqrt((c.real * c.real) + (c.imaginary * c.imaginary));
}

function getComplexArgument(c) {
	if (c.real > 0) {
		if (c.imaginary > 0) {
			return Math.atan(c.imaginary / c.real);
		} else if (c.imaginary < 0) {
			return 2*Math.PI + Math.atan(c.imaginary / c.real);
		} else {
			return 0;
		}
	} else if (c.real < 0) {
		if (c.imaginary > 0) {
			return (Math.PI / 2) + Math.atan(c.real / c.imaginary);
		} else if (c.imaginary < 0) {
			return (Math.PI) + Math.atan(c.imaginary / c.real);
		} else {
			return 0;
		}
	} else if (c.imaginary > 0) {
		return PI/2;
	} else if (c.imaginary < 0) {
		return (3*PI)/2;
	} else {
		return null;
	}
	
}