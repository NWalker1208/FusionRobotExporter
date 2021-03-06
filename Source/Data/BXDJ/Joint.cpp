#include "Joint.h"
#include <Fusion/Components/JointGeometry.h>
#include <Core/Geometry/Point3D.h>
#include "RigidNode.h"

using namespace BXDJ;

Joint::Joint(const Joint & jointToCopy)
{
	parentOcc = jointToCopy.parentOcc;
	fusionJoint = jointToCopy.fusionJoint;
	parent = jointToCopy.parent;
	child = jointToCopy.child;

	if (jointToCopy.driver != nullptr)
		setDriver(*jointToCopy.driver);
	else
		driver = nullptr;
}

Joint::Joint(RigidNode * parent, core::Ptr<fusion::Joint> fusionJoint, core::Ptr<fusion::Occurrence> parentOccurrence)
{
	parentOcc = (fusionJoint->occurrenceOne() == parentOccurrence) ? ONE : TWO;

	this->fusionJoint = fusionJoint;

	if (parent == NULL)
		throw "Parent node cannot be NULL!";

	this->parent = parent;
	this->child = std::make_shared<RigidNode>((parentOcc == ONE ? fusionJoint->occurrenceTwo() : fusionJoint->occurrenceOne()), this);
	driver = nullptr;
}

RigidNode * Joint::getParent() const
{
	return parent;
}

std::shared_ptr<RigidNode> Joint::getChild() const
{
	return child;
}

Vector3<> Joint::getParentBasePoint() const
{
	core::Ptr<fusion::JointGeometry> geometry = (parentOcc ? fusionJoint->geometryOrOriginOne() : fusionJoint->geometryOrOriginTwo());
	return Vector3<>(geometry->origin()->x(), geometry->origin()->y(), geometry->origin()->z());
}

Vector3<> Joint::getChildBasePoint() const
{
	core::Ptr<fusion::JointGeometry> geometry = (parentOcc ? fusionJoint->geometryOrOriginTwo() : fusionJoint->geometryOrOriginOne());
	return Vector3<>(geometry->origin()->x(), geometry->origin()->y(), geometry->origin()->z());
}

void Joint::setDriver(Driver driver)
{
	this->driver = std::make_unique<Driver>(driver);
}

void Joint::removeDriver()
{
	this->driver = nullptr;
}

std::unique_ptr<Driver> Joint::getDriver() const
{
	if (this->driver != nullptr)
		return std::make_unique<Driver>(*driver);
	else
		return nullptr;
}

void Joint::write(XmlWriter & output) const
{
	if (driver != nullptr)
		output.write(*driver);
}
