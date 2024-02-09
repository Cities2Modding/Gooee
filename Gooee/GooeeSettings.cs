using cohtml.Net;
using Colossal.IO.AssetDatabase;
using Colossal.PSI.Common;
using Game.Modding;
using Game.SceneFlow;
using Game.Settings;
using Game.UI.Menu;
using Game.UI.Widgets;
using Gooee.Helpers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;
using System.Xml;
using System.Xml.Serialization;
using Unity.Entities;

namespace Gooee
{
    public abstract class GooeeSettings : Setting
    {
        [SettingsUIHidden]
        public string ID
        {
            get;
        }

        [SettingsUIHidden]
        protected abstract string UIResource
        {
            get;
        }

        public GooeeSettings( )
        {
            var type = GetType( );
            ID = type.Assembly.GetName( ).Name + "." + type.Name;

            ApplyAndSave( );
        }

        private static bool Register( Setting instance, string name, bool addPrefix )
        {
            var optionsUISystem = World.DefaultGameObjectInjectionWorld?.GetOrCreateSystemManaged<OptionsUISystem>( );

            if ( optionsUISystem == null )
                return false;

            optionsUISystem.RegisterSetting( instance, name, addPrefix );

            return true;
        }

        public static GooeeSettings Load( Type type, GooeeSettings defaults = default )
        {
            var instance = ( GooeeSettings ) Activator.CreateInstance( type );
            instance.SetDefaults( );
            AssetDatabase.global.LoadSettings( type.Name, instance, defaults );
            return instance;
        }

        public static T Load<T>( T defaults = default )
            where T : GooeeSettings
        {
            var type = typeof( T );
            var instance = Activator.CreateInstance<T>( );
            instance.SetDefaults( );
            AssetDatabase.global.LoadSettings( type.Name, instance, defaults );

            return instance;
        }

        internal void Register( string name, bool addPrefix = false ) => Register( this, name, addPrefix );
        public void Register( ) => Register( ID, true );

        public string GetSettingsLocaleID( ) => "Options.SECTION[" + ID + "]";

        public string GetOptionLabelLocaleID( string optionName ) => "Options.OPTION[" + ID + "." + optionName + "]";

        public string GetOptionDescLocaleID( string optionName ) => "Options.OPTION_DESCRIPTION[" + ID + "." + optionName + "]";

        public string GetOptionWarningLocaleID( string optionName ) => "Options.WARNING[" + ID + "." + optionName + "]";

        public string GetOptionTabLocaleID( string tabName ) => "Options.TAB[" + ID + "." + tabName + "]";

        public string GetOptionGroupLocaleID( string groupName ) => "Options.GROUP[" + ID + "." + groupName + "]";

        public string GetEnumValueLocaleID<T>( T value ) where T : Enum => string.Format( "Options.{0}.[{1}]", ID, value );



        public override AutomaticSettings.SettingPageData GetPageData( string id, bool addPrefix )
        {
            if ( EmbeddedResource.Exists( UIResource, GetType( ).Assembly ) )
            {
                var uiResource = EmbeddedResource.LoadText( UIResource, GetType( ).Assembly );

                if ( !string.IsNullOrEmpty( uiResource ) )
                {
                    var settings = GooeeSettingsView.Deserialise( uiResource );

                    AutomaticSettings.SettingPageData pageData = base.GetPageData( id, addPrefix );
                    pageData.tabs.Clear( );

                    if ( settings.Groups?.Count > 0 )
                        GenerateGroups( pageData, settings.Groups );

                    foreach ( var tab in settings.Tabs )
                    {
                        if ( tab.Groups?.Count > 0 )
                            GenerateGroups( pageData, tab.Groups, tab.Title );
                    }

                    return pageData;
                }
                else
                    return base.GetPageData( id, addPrefix );
            }
            else
                return base.GetPageData( id, addPrefix );
        }

        private void GenerateGroups( AutomaticSettings.SettingPageData pageData, List<GooeeSettingsGroup> groups, string tab = "General"  )
        {
            foreach ( var group in groups )
            {
                if ( !string.IsNullOrEmpty( group.Description ) )
                {
                    AutomaticSettings.SettingItemData settingItemData = new AutomaticSettings.SettingItemData( )
                    {
                        setting = this,
                        property = new AutomaticSettings.ManualProperty( GetType( ), typeof( string ), group.Description )
                        {
                            canRead = true,
                            canWrite = false,
                            attributes = {
                                        //new SettingsUISectionAttribute( group.Title )
                                        //new SettingsUIDisplayNameAttribute(group.Title)
                                    },
                            getter = ( instance ) =>
                            {
                                return group.Description;
                            },
                        },
                        simpleGroup = group.Title,
                        advancedGroup = group.Title,
                        widgetType = AutomaticSettings.WidgetType.StringField
                    };
                    pageData[tab].AddItem( settingItemData );
                    pageData.AddGroup( settingItemData.simpleGroup );
                    pageData.AddGroupToShowName( settingItemData.simpleGroup );
                }

                foreach ( var field in group.Fields )
                {
                    foreach ( var element in field.Elements )
                    {
                        if ( element is GooeeSettingButton button )
                        {
                            AutomaticSettings.SettingItemData settingItemData = new AutomaticSettings.SettingItemData( )
                            {
                                setting = this,
                                property = new AutomaticSettings.ManualProperty( GetType( ), typeof( string ), button.Content )
                                {
                                    canRead = false,
                                    canWrite = true,
                                    attributes = 
                                    {
                                        new SettingsUIButtonAttribute()
                                    },
                                    setter = ( instance, value ) =>
                                    {
                                        var settings = ( GooeeSettings ) instance;
                                        var method = settings.GetType( ).GetMethod( button.Content, BindingFlags.Instance | BindingFlags.Public );
                                        method?.Invoke( instance, null );
                                    },
                                },
                                simpleGroup = group.Title,
                                advancedGroup = group.Title,
                                widgetType = AutomaticSettings.WidgetType.BoolButton
                            };
                            pageData[tab].AddItem( settingItemData );
                            pageData.AddGroup( settingItemData.simpleGroup );
                            pageData.AddGroupToShowName( settingItemData.simpleGroup );
                        }
                        else if ( element is GooeeSettingSlider slider )
                        {

                        }
                        else if ( element is GooeeSettingCheckBox checkbox )
                        {
                            AutomaticSettings.SettingItemData settingItemData = new AutomaticSettings.SettingItemData( )
                            {
                                setting = this,
                                property = new AutomaticSettings.ManualProperty( GetType( ), typeof( string ), checkbox.IsChecked )
                                {
                                    canRead = true,
                                    canWrite = true,
                                    attributes = {
                                                //new SettingsUISectionAttribute( group.Title, field.Title ),
                                                //new SettingsUIDisplayNameAttribute(group.Title)
                                            },
                                    getter = ( instance ) =>
                                    {
                                        var settings = ( GooeeSettings ) instance;
                                        var property = settings.GetType( ).GetProperty( checkbox.IsChecked, BindingFlags.Instance | BindingFlags.Public );

                                        return ( bool ) property.GetValue( settings );
                                    },
                                    setter = ( instance, value ) =>
                                    {
                                        var settings = ( GooeeSettings ) instance;
                                        var property = settings.GetType( ).GetProperty( checkbox.IsChecked, BindingFlags.Instance | BindingFlags.Public );

                                        property.SetValue( settings, value );
                                    },
                                },
                                simpleGroup = group.Title,
                                advancedGroup = group.Title,
                                widgetType = AutomaticSettings.WidgetType.BoolToggle
                            };
                            pageData[tab].AddItem( settingItemData );
                            pageData.AddGroup( settingItemData.simpleGroup );
                            pageData.AddGroupToShowName( settingItemData.simpleGroup );
                        }
                        else if ( element is GooeeSettingDropdown dropDown )
                        {
                            AutomaticSettings.SettingItemData settingItemData = new AutomaticSettings.SettingItemData( )
                            {
                                setting = this,
                                property = new AutomaticSettings.ManualProperty( GetType( ), typeof( string ), dropDown.Selected )
                                {
                                    canRead = true,
                                    canWrite = true,
                                    attributes = 
                                    {
                                        new SettingsUIDropdownAttribute( GetType(), dropDown.Options )
                                    },
                                    getter = ( instance ) =>
                                    {
                                        var settings = ( GooeeSettings ) instance;
                                        var property = settings.GetType( ).GetProperty( dropDown.Selected, BindingFlags.Instance | BindingFlags.Public );

                                        return ( string ) property.GetValue( settings );
                                    },
                                    setter = ( instance, value ) =>
                                    {
                                        var settings = ( GooeeSettings ) instance;
                                        var property = settings.GetType( ).GetProperty( dropDown.Selected, BindingFlags.Instance | BindingFlags.Public );

                                        property.SetValue( settings, value );
                                    },
                                },
                                simpleGroup = group.Title,
                                advancedGroup = group.Title,
                                widgetType = AutomaticSettings.WidgetType.StringDropdown
                            };
                            pageData[tab].AddItem( settingItemData );
                            pageData.AddGroup( settingItemData.simpleGroup );
                            pageData.AddGroupToShowName( settingItemData.simpleGroup );
                        }
                    }
                }

            }
        }
    }

    public abstract class GooeeSettingElement
    {
    }

    public class GooeeFieldElement
    {
        [XmlAttribute( "title" )]
        public string Title
        {

            get;
            set;
        }

        [XmlElement( "description" )]
        public string Description
        {

            get;
            set;
        }

        [XmlElement( "button", Type = typeof( GooeeSettingButton ) )]
        [XmlElement( "checkbox", Type = typeof( GooeeSettingCheckBox ) )]
        [XmlElement( "select", Type = typeof( GooeeSettingDropdown ) )]
        [XmlElement( "slider", Type = typeof( GooeeSettingSlider ) )] 
        public List<GooeeSettingElement> Elements
        {
            get;
            set;
        }
    }

    public class GooeeSettingsGroup : GooeeSettingElement
    {
        [XmlAttribute( "title" )]
        public string Title
        {

            get;
            set;
        }

        [XmlElement( "description" )]
        public string Description
        {

            get;
            set;
        }

        [XmlElement( "field" )]
        public List<GooeeFieldElement> Fields
        {
            get;
            set;
        }
    }

    public class GooeeSettingButton : GooeeSettingElement
    {
        [XmlText]
        public string Content
        {
            get;
            set;
        }

        [XmlAttribute( "onClick" )]
        public string OnClick
        {
            get;
            set;
        }
    }

    public class GooeeSettingCheckBox : GooeeSettingElement
    {
        [XmlAttribute( "isChecked" )]
        public string IsChecked
        {
            get;
            set;
        }
    }

    public class GooeeSettingDropdown : GooeeSettingElement
    {
        [XmlAttribute( "options" )]
        public string Options
        {
            get;
            set;
        }

        [XmlAttribute( "selected" )]
        public string Selected
        {
            get;
            set;
        }
    }

    public class GooeeSettingSlider : GooeeSettingElement
    {
        [XmlAttribute( "value" )]
        public int Value
        {
            get;
            set;
        }

        [XmlAttribute( "min" )]
        public int Minimum
        {
            get;
            set;
        }

        [XmlAttribute( "max" )]
        public int Maximum
        {
            get;
            set;
        }
    }

    public class GooeeSettingsTab
    {
        [XmlAttribute( "title" )]
        public string Title
        {
            get;
            set;
        }

        [XmlElement( "group" )]
        public List<GooeeSettingsGroup> Groups
        {
            get;
            set;
        }
    }

    [XmlRoot( "settings" )]
    public class GooeeSettingsView
    {
        [XmlElement( "group" )]
        public List<GooeeSettingsGroup> Groups
        {
            get;
            set;
        }

        [XmlElement( "tab" )]
        public List<GooeeSettingsTab> Tabs
        {
            get;
            set;
        }

        public static GooeeSettingsView Deserialise( string xml )
        {
            if ( string.IsNullOrEmpty( xml ) )
                return null;

            using ( var ms = new MemoryStream( Encoding.UTF8.GetBytes( xml ) ) )
            {
                var serialiser = new XmlSerializer( typeof( GooeeSettingsView ) );
                return ( GooeeSettingsView ) serialiser.Deserialize( ms );
            }
        }
    }
}
