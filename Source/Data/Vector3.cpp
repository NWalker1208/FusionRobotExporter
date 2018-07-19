#include "Vector3.h"

Vector3::Vector3() : Vector3(0, 0, 0)
{}

Vector3::Vector3(const Vector3 & vector)
{
	x = vector.x;
	y = vector.y;
	z = vector.z;
}

Vector3::Vector3(double x, double y, double z)
{
	this->x = x;
	this->y = y;
	this->z = z;
}

Vector3 Vector3::operator+(const Vector3 & other) const
{
	return Vector3(x + other.x, y + other.y, x + other.z);
}

Vector3 Vector3::operator*(double scale) const
{
	return Vector3(x * scale, y * scale, z * scale);
}

Vector3 Vector3::operator/(double scale) const
{
	return Vector3(x / scale, y / scale, z / scale);
}