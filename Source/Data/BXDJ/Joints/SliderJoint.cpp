#include "SliderJoint.h"
#include <Fusion/Components/JointLimits.h>
#include <Core/Geometry/Vector3D.h>
#include "../ConfigData.h"
#include "../Driver.h"

using namespace BXDJ;

SliderJoint::SliderJoint(const SliderJoint & jointToCopy) : Joint(jointToCopy)
{
	fusionJointMotion = jointToCopy.fusionJointMotion;
}

SliderJoint::SliderJoint(RigidNode * parent, core::Ptr<fusion::Joint> joint, core::Ptr<fusion::Occurrence> parentOccurrence) : Joint(parent, joint, parentOccurrence)
{
	this->fusionJointMotion = this->getFusionJoint()->jointMotion();
}

Vector3<> SliderJoint::getAxisOfTranslation() const
{
	core::Ptr<core::Vector3D> axis = fusionJointMotion->slideDirectionVector();
	return Vector3<>(axis->x(), axis->y(), axis->z());
}

float SliderJoint::getCurrentTranslation() const
{
	return (float)fusionJointMotion->slideValue();
}

float SliderJoint::getMinTranslation() const
{
	if (fusionJointMotion->slideLimits()->isMinimumValueEnabled())
		return (float)fusionJointMotion->slideLimits()->minimumValue();
	else
		return std::numeric_limits<float>::min();
}

float SliderJoint::getMaxTranslation() const
{
	if (fusionJointMotion->slideLimits()->isMaximumValueEnabled())
		return (float)fusionJointMotion->slideLimits()->maximumValue();
	else
		return std::numeric_limits<float>::max();
}

void SliderJoint::applyConfig(const ConfigData & config)
{
	// Update wheels with actual mesh information
	std::unique_ptr<Driver> driver = config.getDriver(getFusionJoint());
	if (driver != nullptr)
	{
		setDriver(*driver);
	}
}

void SliderJoint::write(XmlWriter & output) const
{
	// Write joint information
	output.startElement("LinearJoint");

	// Base point
	output.startElement("BXDVector3");
	output.writeAttribute("VectorID", "BasePoint");
	output.write(getChildBasePoint());
	output.endElement();

	// Axis
	output.startElement("BXDVector3");
	output.writeAttribute("VectorID", "Axis");
	output.write(getAxisOfTranslation());
	output.endElement();

	// Limits
	output.writeElement("LinearLowLimit", std::to_string(getMinTranslation()));
	output.writeElement("LinearUpperLimit", std::to_string(getMaxTranslation()));

	// Current angle
	output.writeElement("CurrentLinearPosition", std::to_string(getCurrentTranslation()));

	output.endElement();

	// Write driver information
	Joint::write(output);
}
