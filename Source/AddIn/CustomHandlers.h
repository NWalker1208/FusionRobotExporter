#pragma once

#include <Core/CoreAll.h>

using namespace adsk::core;
using namespace adsk::fusion;

namespace Synthesis
{
	class EUI;

	// Workspace Events
	class WorkspaceActivatedHandler : public WorkspaceEventHandler
	{
	public:
		WorkspaceActivatedHandler(EUI * eui) : eui(eui) {}
		void notify(const Ptr<WorkspaceEventArgs>& eventArgs) override;
	private:
		EUI * eui;
	};

	class WorkspaceDeactivatedHandler : public WorkspaceEventHandler
	{
	public:
		WorkspaceDeactivatedHandler(Ptr<UserInterface> UI) : UI(UI) {}
		void notify(const Ptr<WorkspaceEventArgs>& eventArgs) override;
	private:
		Ptr<UserInterface> UI;
	};

	// Button Events
	class ShowPaletteCommandCreatedHandler : public CommandCreatedEventHandler
	{
	public:
		ShowPaletteCommandCreatedHandler(Ptr<Application> app) : app(app) {}
		void notify(const Ptr<CommandCreatedEventArgs>& eventArgs) override;
	private:
		Ptr<Application> app;
	};

	class ShowPaletteCommandExecuteHandler : public CommandEventHandler
	{
	public:
		ShowPaletteCommandExecuteHandler(Ptr<Application> app) : app(app) {}
		void notify(const Ptr<CommandEventArgs>& eventArgs) override;
	private:
		Ptr<Application> app;
	};

	// Palette Events
	class ReceiveFormDataHandler : public HTMLEventHandler
	{
	public:
		ReceiveFormDataHandler(Ptr<Application> app, EUI * eui) : app(app), eui(eui) { }
		void notify(const Ptr<HTMLEventArgs>& eventArgs) override;
	private:
		const char ASCII_OFFSET = -32;
		Ptr<Application> app;
		EUI * eui;
	};

	class CloseFormEventHandler : public UserInterfaceGeneralEventHandler
	{
	public:
		CloseFormEventHandler(Ptr<Application> app) : app(app) {}
		void notify(const Ptr<UserInterfaceGeneralEventArgs>& eventArgs) override;
	private:
		Ptr<Application> app;
	};
}
