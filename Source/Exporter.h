#pragma once

#include <Core/CoreAll.h>
#include <Fusion/FusionAll.h>
#include "Data/BXDJ/ConfigData.h"

using namespace adsk::core;
using namespace adsk::fusion;

namespace Synthesis
{
	class Exporter
	{
	public:
		static std::vector<Ptr<Joint>> collectJoints(Ptr<FusionDocument>);
		static std::string stringifyJoints(std::vector<Ptr<Joint>>);

		static void exportExample();
		static void exportExampleXml();
		static void exportMeshes(BXDJ::ConfigData, Ptr<FusionDocument>);
	};
}
