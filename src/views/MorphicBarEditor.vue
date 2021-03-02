<template>
  <div>
    <!-- MODALs: BEGIN -->
    <EditButtonDialog ref="editDialog" />

    <b-modal id="roleChangeConfirm" @ok="changeMemberRole" title="Change Member Role" footer-bg-variant="light" ok-title="Change Role">
      <p class="my-4">Please confirm this role change?</p>
    </b-modal>
        <b-modal id="deleteConfirm" @ok="deleteMember" title="Delete Member" footer-bg-variant="light" ok-title="Delete">
      <p class="my-4">Please confirm the deletion of this member?</p>
    </b-modal>
    <b-modal id="barDeleteConfirm" @ok="deleteBar" title="Delete Bar" footer-bg-variant="light" ok-title="Delete">
      <p class="my-4">Please confirm the deletion of this bar?</p>
    </b-modal>
    <b-modal id="sendEmailInvitationModal" :ok-disabled="!invitationEmail.match('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')" @ok="sendInvite" title="Enter email address for invitation" footer-bg-variant="light" ok-title="Send Invitation">
      <p class="my-4"></p>
      <b-form-group :label="'Please enter email address for '+this.memberDetails.first_name+' '+this.memberDetails.last_name" label-for="email">
        <b-form-input v-model="invitationEmail" id="email" placeholder="myemail@mail.com" class="mb-2"></b-form-input>
      </b-form-group>
    </b-modal>
    <!-- MODALs: END -->

    <!-- EDITOR v2 -->
    <b-row no-gutters id="EditorContainer">
      <b-col md="2">
        <CommunityManager :community="community" :bars="barsList" :members="membersList" :activeMemberId="activeMemberId" :activeBarId="activeMemberId ? null : barDetails.id" />
      </b-col>
      <b-col md="8">
        <div id="barEditor" class="pt-2">

          <!-- Topmost area above desktop image -->
          <div id="bar-info">
            <div class="bar-name">
              <h3 v-if="activeMemberId" class="mb-0">
                <b>Bar for {{ memberDetails.first_name }} {{memberDetails.last_name}}</b>&nbsp;
              </h3>
              <b-form-group v-else-if="newBar" label="Bar Name" label-for="barName">
                <b-form-input v-model="barDetails.name" id="barName" placeholder="Enter new bar name" class="mb-2"></b-form-input>
              </b-form-group>
              <h3 v-else class="mb-0">
                <b>{{ barDetails.name === 'Default' ? 'Default Bar' : barDetails.name }}</b>&nbsp;
                <span v-if="barDetails.name !== 'Default'" class="small">(<b-link @click="editBarName = !editBarName">Edit Bar name</b-link>)</span>
              </h3>
              <b-form-group v-if="!activeMemberId && editBarName" label-for="barName">
                <br/>
                <b-form-input @input="isChanged = true" v-model="barDetails.name" id="barName" placeholder="Edit bar name" class="mb-2"></b-form-input>
              </b-form-group>
            </div>
            <div class="save-button-area">
              <b-button v-if="isChanged && !newBar" @click="revertBar" variant='warning' class="revertButton" size="sm">Revert to last saved</b-button>
              <b-button v-if="activeMemberId" @click="addPersonalBar" :variant="isChanged ? 'success' : 'outline-dark'" class="addButton" size="sm"><b-icon-arrow-clockwise></b-icon-arrow-clockwise> Save to member's MorphicBar</b-button>
              <b-button v-else-if="newBar" @click="addBar" :variant="isChanged ? 'success' : 'outline-dark'" class="updateButton" size="sm"><b-icon-arrow-clockwise></b-icon-arrow-clockwise> Add new bar</b-button>
              <b-button v-else @click="saveBar" :variant="isChanged ? 'success' : 'outline-dark'" class="updateButton" size="sm"><b-icon-arrow-clockwise></b-icon-arrow-clockwise> Save this to Community Bar</b-button>
            </div>
          </div>

          <!-- Secondary area above desktop image -->
          <div id="secondary-bar-info">
            <b-nav id="editorNav" tabs class="small">
              <b-nav-item :active="tab === 1" @click="tab = 1"><b-icon-person-circle></b-icon-person-circle>
                <span v-if="activeMemberId">
                  Member Details
                </span>
                <span v-else-if="getMembersCount() === 0">
                  Unused Bar
                </span>
                <span v-else>
                  Members ({{ getMembersCount() }})
                </span>
              </b-nav-item>
              <b-nav-item disabled :active="tab === 2" @click="tab = 2"><b-icon-gear-fill></b-icon-gear-fill> Bar Settings</b-nav-item>
              <span v-if="getBarRemoveValidity()">
                <b-nav-item v-b-modal.barDeleteConfirm id="removeBar">Remove Bar</b-nav-item>
              </span>
            </b-nav>
            <div class="barSelectorArea">
              <div v-if="activeMemberId">
                <b-form-select v-model="barSelectedInDropdown">
                  <b-form-select-option value="customized" v-if="isChanged || barDetails.is_shared == false">Customized</b-form-select-option>
                  <b-form-select-option v-for="bar in availableBars" :key="bar.id" :value="bar.id">{{bar.name}}</b-form-select-option>
                </b-form-select>
                <b-button class="changeButton" variant="success" :disabled="memberDetails.bar_id == barSelectedInDropdown || barSelectedInDropdown == 'customized'" @click="changeUserBarToCommunityBar">Change</b-button>

              </div>
            </div>
            <div class="userInvitationStatusArea">
              <span v-if="activeMemberId && memberDetails.state === 'active'">
                <span class="green dot"></span>
                <span class="text">active</span>
              </span>
              <span v-else-if="activeMemberId && memberDetails.state === 'uninvited'" @click="getEmailAndSendInvite()">
                <span class="red dot"></span>
                <button class="linkStyling">Invite member</button>
              </span>
              <span v-else-if="activeMemberId && memberDetails.state === 'invited'" @click="getEmailAndSendInvite()">
                <span class="yellow dot"></span>
                <button class="linkStyling">Re-invite member</button>
              </span>
            </div>
          </div>

          <div v-if="tab === 1" class="bg-light p-3">
            <button @click="tab = 0" type="button" aria-label="Close" class="close">×</button>
            <div v-if="activeMemberId">
              <h5><b-icon-person-circle></b-icon-person-circle> <b>{{ memberDetails.first_name }}</b></h5>
              <ul class="list-unstyled small">
                <li v-if="memberDetails.role === 'member'"><b-link v-b-modal.roleChangeConfirm>Make member a Community Manager</b-link></li>
                <li v-else><b-link v-b-modal.roleChangeConfirm>Remove community manager role from member</b-link></li>
                <li><b-link v-b-modal.deleteConfirm class="text-danger">Delete member</b-link></li>
                <li v-if="memberDetails.state === 'uninvited'" @click="getEmailAndSendInvite()"><b-link>Send Invitation</b-link></li>
                <li v-else @click="getEmailAndSendInvite()"><b-link>Reinvite member</b-link></li>

              </ul>
            </div>
            <div v-else-if="getMembersCount() === 0">
              <h5><b-icon-person-circle></b-icon-person-circle> <b>This Morphic Bar is NOT used</b></h5>
              <p class="mb-0">You can go back to the <b-link to="/dashboard">Dashboard</b-link> and invite members to use it.</p>
            </div>
            <div v-else>
              <h5><b-icon-person-circle></b-icon-person-circle> <b>This Morphic Bar is used by {{ getMembersCount() }} members</b></h5>
              <ul class="small mb-0">
                <li v-for="member in members" v-bind:key="member.id">
                  <p>{{ member.first_name }} {{ member.last_name }}</p>
                </li>
              </ul>
            </div>
          </div>
          <div v-else-if="tab === 2" class="bg-light p-3">
            <button @click="tab = 0" type="button" aria-label="Close" class="close">×</button>
            <h5><b-icon-gear-fill></b-icon-gear-fill> <b>Morphic Bar settings</b></h5>
            <b-form-checkbox id="barOnRight" v-model="bar.settings.barOnRight" name="barOnRight" value="true" unchecked-value="false">
              Bar on the right of the screen
            </b-form-checkbox>
            <b-form-checkbox id="cannotClose" v-model="bar.settings.cannotClose" name="cannotClose" value="true" unchecked-value="false">
              Member cannot close bar
            </b-form-checkbox>
            <b-form-checkbox id="startsOpen" v-model="bar.settings.startsOpen" name="startsOpen" value="true" unchecked-value="false">
              Morphic Bar always starts open
            </b-form-checkbox>
          </div>
          <div v-else-if="tab === 3" class="bg-light p-3">
            <button @click="tab = 0" type="button" aria-label="Close" class="close">×</button>
            <h5><b-icon-fullscreen></b-icon-fullscreen> <b>Try this bar on your own computer</b></h5>
            <p>
              You need to have Morphic installed on your computer to try out bars in your community.
              <b-link to="/learn/how-to-install">Learn how to set up your computer</b-link>.
            </p>
            <b-button variant="primary">Try this Morphic Bar on my computer</b-button>
          </div>
          <div id="preview-holder" class="desktop mt-3">
            <drop mode="cut" class="dragToDelete desktop-portion">
              <template v-slot:drag-image="">
                <img src="/img/trash.svg" style="height: 100px; width: 100px; margin-left: -50px; margin-top: -50px"/>
              </template>

              <!-- Bar item problems -->
              <div class="desktop-alerts" >
                <b-alert v-for="(error) in barDetails.errors"
                         :key="error.key"
                         show
                         variant="warning"
                >
                  <div @mouseenter="highlight(true, error.item, error.duplicates)"
                       @mouseleave="highlight(false, error.item, error.duplicates)"
                       @click="showEditDialog(error.item)"
                       :title="error.details"
                        >

                    <b-icon-exclamation-triangle-fill v-if="!error.level || error.level === 'error'" variant="danger"/>
                    <b-icon-info-circle-fill v-if="error.level === 'warn'" variant="info"/>
                    &nbsp;

                    <!-- Duplicated labels -->
                    <template v-if="error.type === 'duplicate' && error.item.configuration.label === error.duplicates[0].configuration.label">
                      <BarItemLink :bar-item="error.item"
                                   @click="showEditDialog(error.item)"
                                   @mouseover="highlight(false, error.item)"
                                   @mouseleave="highlight(true, error.item)"
                      /> is duplicated.
                    </template>

                    <!-- Duplicated actions -->
                    <template v-else-if="error.type === 'duplicate'">
                      <BarItemLink :bar-item="error.item"
                              @click="showEditDialog(error.item)"
                              @mouseover="highlight(false, error.item)"
                              @mouseleave="highlight(true, error.item)"
                      />

                      performs the same action as
                      <BarItemLink :bar-item="error.duplicates[0]"
                              @click="showEditDialog(error.duplicates[0])"
                              @mouseenter="highlight(false, error.duplicates)"
                              @mouseleave="highlight(true, error.duplicates)"
                      />
                    </template>

                    <!-- Generic problem -->
                    <template v-else>
                      <BarItemLink :bar-item="error.item"
                              @click="showEditDialog(error.item)"
                        />:
                      {{ error.message }}
                    </template>

                  </div>
                </b-alert>
              </div>

            </drop>

            <!-- Buttons Bar -->
            <div id="preview-bar">
              <div class="barPreviewEditor" ref="myref">
                <drop-list :items="barDetails.items" :class="openDrawer && 'showDrawer'" class="buttonsList draggable-area" @insert="dropToBar" @reorder="$event.apply(barDetails.items)">
                  <template v-slot:item="{item}">
                    <drag :key="item.id"
                      @dragstart="setDragInProgress(true)"
                      @dragend="setDragInProgress(false)"
                      @click="showEditDialog(item, $event)"
                      @cut="removeButton(item, barDetails.items)"
                      class="buttonDragger">
                      <div :key="item.id" class="previewHolder" :ref="buttonRef(item)">
                        <PreviewItem :item="item" />
                      </div>
                    </drag>o
                  </template>
                  <template v-slot:feedback="{data}">
                    <div class="item feedback button-feedback" :key="data.id"></div>
                  </template>
                </drop-list>
              </div>
              <div class="logoHolder">
                <b-img src="/img/logo-color.svg" alt="Morphic Logo" />
              </div>
              <div class="openDrawerIconHolder">
                <span @click="openDrawer = !openDrawer" class="">
                  <b-icon :icon="openDrawer ? 'arrow-right-circle-fill' : 'arrow-left-circle-fill'"></b-icon>
                </span>
              </div>
            </div>
          </div>
        </div>
      </b-col>

      <!-- Button Catalogue -->
      <b-col md="2">
        <drop class="cut" mode="cut">
          <template v-slot:drag-image="">
            <img src="/img/trash.svg" style="height: 100px; width: 100px; margin-left: -50px; margin-top: -50px"/>
          </template>

          <div id="buttonsPanel"
               class="fill-height bg-silver" :class="{
                noResults: searchState === 'noResults',
                gotResults: searchState === 'gotResults',
                searchResults: !!searchState
               }" >

            <!-- search -->
            <b-input-group id="search-group" class="catalogSearch" size="sm" >
              <b-form-input type="search" placeholder="Search buttons" v-model="searchText" />
              <b-input-group-append>
                <b-button variant="outline-secondary"><b-icon-search /></b-button>
              </b-input-group-append>
            </b-input-group>

            <ul v-for="(catalog, isSearchResult) in [buttonCatalog, searchResult]"
                :key="isSearchResult"
                class="buttonCatalogListing linkList list-unstyled"
                :class="{ searchResults: isSearchResult}"
                style="overflow-y: scroll; max-height: 630px;">

              <li v-if="isSearchResult && searchResult && searchResult.itemsFound.hidden">
                <small>No buttons where found while searching for '<code>{{searchText}}</code>'</small>
              </li>
              <template v-for="(buttonGroup, subkind) in catalog">
                <li v-if="!buttonGroup.hidden"
                    :key="subkind"
                    :ref="`catalogGroup_${subkind}`"
                    class="catalogGroup"
                    :class="{
                        hasSecondary: buttonGroup.hasSecondary,
                        showSecondary: secondaryItemsShown[subkind],
                        searchResult: buttonGroup.isSearchResult
                    }">

                  <h3 v-if="buttonGroup.title">{{buttonGroup.title}}</h3>

                  <ul class="buttonCatalogEntries">
                    <template v-for="(button, buttonId) in buttonGroup.items">
                      <li :key="button.data.buttonKey"
                          class="buttonCatalogEntry"
                          :class="{
                              noImage: !button.configuration.image_url && !button.data.isExpander,
                              secondaryItem: !button.is_primary,
                              expander: button.data.isExpander,
                          }"
                          :style="{order: button.searchResult && button.searchResult.order}"
                          :title="button.configuration.description"
                          :ref="'catalog_' + buttonId"
                          tabindex="-1"
                          @keypress="onCatalogItemKeyPress($event, button)"
                      >
                        <!-- Render each button as draggable -->
                        <drag :data="button" type="catalogButtonWithImage">
                          <!-- Define looks when dragged -->
                          <template v-slot:drag-image>
                            <PreviewItem :item="button" :noImage="false" xclass="noImage" />
                          </template>

                          <!-- Define looks when not selected -->
                          <b-link v-if="buttonId !== expandedCatalogButtonId"
                                  @click="expandCatalogButton(button, buttonId, subkind)"
                                  :style="'color: ' + (button.configuration.color || colors.blue) + ';'"
                                  class="buttonCatalogEntry nonExpandedCatalogEntry">
                            <div class="imageWrapper" :class="{expanderIcon:button.data.isExpander}">
                              <b-iconstack v-if="button.data.isExpander">
                                <b-icon stacked icon="circle-fill" />
                                <b-icon stacked icon="caret-right-fill"
                                        scale="0.9"
                                        class="text-white" />
                              </b-iconstack>

                              <b-img v-else-if="button.configuration.image_url" :src="getIconUrl(button.configuration.image_url)" alt="Logo"/>
                            </div>
                            <span v-html="getCatalogItemLabel(button, buttonGroup.searchWords)" />
<!--                            <span v-if="button.searchResult && button.searchResult.label" v-html="button.searchResult.label"/>-->
<!--                            <span >{{ button.data.catalogLabel || button.configuration.label }}</span>-->
                          </b-link>

                          <!-- Define looks when selected (expanded) -->
                          <div v-else class="active" @click="expandedCatalogButtonId = undefined"
                          >
                            <div style="width: 100%; display: inline-flex; align-items: center;">
                              <b-img v-if="button.configuration.image_url" :src="getIconUrl(button.configuration.image_url)" style="width: 20px; height: 20px; max-width: 20px; max-height: 20px;"/>
                              <b-img v-else :src="'/icons/bootstrap.svg'" style="width: 20px; height: 20px; max-width: 20px; max-height: 20px;"></b-img>
                              <h3 style="margin-block-start: inherit; text-decoration-line: underline; margin-left: 0.5rem; margin-bottom: 0.05rem;">{{button.configuration.label}}</h3>
                            </div>
                            <div class="description">{{button.configuration.description || "A button that enables the functionality described above"}}</div>
                            <div class="help">To add this button, press ENTER, RETURN, or drag button below onto the bar</div>
                            <div class="buttons"
                                 @click="$event.stopPropagation()"
                            >
                              <drag :data="button" type="catalogButtonNoImage">
                                <PreviewItem :item="button"
                                             :simplified="true" :noImage="true"
                                             class="noImage"
                                             @addToBarFromPreview="dropToBar($event)"
                                             @click="dropToBar($event, true)"
                                />
                              </drag>

                              <drag v-if="button.kind !== 'action'" :data="button" type="catalogButtonWithImage">
                                <template v-slot:drag-image>
                                  <PreviewItem :item="button" :noImage="false" class="noImage"
                                               @click="dropToBar($event, true)"
                                  />
                                </template>
                                <PreviewItem v-if="button.configuration.image_url"
                                             :item="button" :simplified="true" class="withImage"
                                             @addToBarFromPreview="dropToBar($event)"
                                             @click="dropToBar($event)"
                                />
                              </drag>
                            </div>
                          </div>
                        </drag>
                      </li>
                    </template>
                  </ul>
                </li>
              </template>
            </ul>
          </div>
        </drop>
      </b-col>
    </b-row>
  </div>
</template>

<style lang="scss">
  $primary-color: #002957;
  $secondary-color: #84c661;

  #EditorContainer {

  }

  #barEditor {
    padding-left: 15px;
    padding-right: 15px;
    #bar-info {
      display: flex;

      .bar-name {
        flex-grow: 1;
      }
    }
  }

  #secondary-bar-info {
    display: grid;
    grid-template-columns: 33% auto 33%;
    margin-top: 13px;

    #editorNav {
      position: relative;
      .addButton, .updateButton {
        position: absolute;
        right: 0;
        top: 6px;
      }
    }

    .barSelectorArea {
      select.custom-select {
        width: inherit;
      }
      button {
        margin-left: 11px;
      }
    }
    .userInvitationStatusArea {
      text-align: right;

      .dot {
        height: 13px;
        width: 13px;
        display: inline-block;
        border-radius: 50%;
        vertical-align: middle;

        &.green { background-color: #3bc03b; }
        &.yellow { background-color: #f3c702; }
        &.red { background-color: #f20202; }
      }

      .linkStyling {
        border: none;
        background: inherit;
        color: #069;
        cursor: pointer;
      }
    }
  }

  #preview-holder.desktop {
    width: 100%;
    height: 600px;
    display: flex;

    .desktop-portion {
      display: inline-block;
      flex-grow: 1;
    }

    .desktop-alerts {
      height: 100%;
      display: flex;
      justify-content: flex-end;
      flex-direction: column;
      .alert {
        width: fit-content;
        padding: 0;
        & > div {
          padding: 5px;
        }
        margin: 0 5px 10px 5px;

        transition: box-shadow 0.2s ease;
        cursor: pointer;

        &:hover {
          box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.4);
        }

        svg {
          margin: 0 0.2em;
        }

      }
    }

    #preview-bar {
      border: 1px solid #002957;
      background: white;
      // vertical line separating bar from drawer
      background-image: linear-gradient(#000, #000);
      background-size: 1px 100%;
      background-repeat: no-repeat;
      background-position: right 122px bottom 0px;

      display: flex;
      justify-content: center;
      align-content: center;

      // flex columns don't expand the container, so rotate the text flow here, and make the buttonList flex-direction to row
      writing-mode: vertical-rl;

      .barPreviewEditor {
        min-width: 120px;
        flex-grow: 1;

        .buttonsList {
          height: 100%;

          display: inline-flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: flex-start;
          align-content: flex-start;

          max-width: 400px;
          // Hide the drawer by limiting the width
          &:not(.showDrawer) {
            width: 120px !important;
            overflow: hidden;
          }

          & > div {
            min-width: 50px;
          }

          // Place-holder for dropping a new button.
          .button-feedback, .feedback {
            display: block;
            background-color: #e5f4ed;
            border: 2px dashed rgb(16 141 74);
            height: 50px;
            min-width: 95px;
            margin-left: 10px;
            margin-right: 10px;
            border-radius: 10px;
            margin-top: 10px;

            &.clickDropSpot {
              margin-top: 0px;
            }
          }
        }

        .buttonDragger {
          writing-mode: horizontal-tb;
          margin: 10px 10px 0 10px;
        }
      }

      .logoHolder {
        writing-mode: initial;
        text-align: center;
        width: 120px;
        padding: 15px 0 15px 0;
      }

      .openDrawerIconHolder > span {
        cursor: pointer;
      }
    }
  }

  #buttonsPanel {

    padding: 0.5rem;

    .catalogSearch {
    }

    img:before {
      content: " ";
    }

    // Hide the listing if search is used
    &.searchResults {
      .buttonCatalogListing:not(.searchResults) {
        display: none;
      }
    }
    &:not(.searchResults) {
      .buttonCatalogListing.searchResults {
        display: none;
      }
    }

    .buttonCatalogListing {
      padding: 0.5rem;

      h3 {
        font-size: 1.30rem;
        margin-bottom: 6px;
        margin-top: 0;
        font-weight: bold;
      }

      .catalogGroup {
        margin-bottom: 1em;

        // Hide secondary items.
        &:not(.showSecondary, .searchResult) {
          .secondaryItem {
            display: none;
          }
        }

        &.showSecondary {
          .expanderIcon > * {
            transform: rotate(90deg) !important;
          }
        }

        .buttonCatalogEntries {
          display: flex;
          flex-direction: column;
          padding-left: 30px;
          list-style: none;

          .buttonCatalogEntry {
            position: relative;

            // show the primary items first
            &:not(.secondaryItem) {
              order: 0;
            }
            &.expander {
              order: 1;
            }
            &.secondaryItem {
              order: 2;
            }

            .imageWrapper {
              // Position the icon to the left, and remove it from the flow.
              display: inline-block;
              position: relative;
              left: -23px;
              width: 0;
              overflow: visible;

              & > * {
                transition: all 0.2s ease-in-out;
              }
            }

            a:hover {
              .imageWrapper > * {
                transform: scale(1.5);
              }
            }

            &.noImage {
              img {
                display: none;
              }
            }

            .active {
              background-color: #e0f1d7;
              border: solid 1px #008145;
              border-radius: 5px;
              padding: 10px;

              .buttons {
                display: flex;
                justify-content: space-around;
                align-items: flex-end;
              }

              h3 {
                margin-top: 15px;
                font-size: 20px;
                margin-bottom: 0px;
              }

              div.description {
                font-size: 14px;
              }

              div.help {
                font-size: 14px;
                font-weight: bold;
                margin-top: 15px;
                line-height: 18px;
              }
            }
          }
        }
      }
    }
  }

  .max-height {
    height: 100%;
  }
  #removeBar .nav-link {
    color: #dc3545 !important;
  }

  .compactIconHolder {
    height: 22rem;
    overflow-y: auto;
    .iconBoxHolder {
      margin-left: .5rem !important;
    }
  }

  .colorBoxHolder {
    display: inline-block;
    cursor: pointer;
    margin: 0 .25rem;
    width: 2.6rem;
    height: 2.6rem;
    .colorBox {
      width: 2rem;
      height: 2rem;
    }
  }

  .iconBoxHolder {
    display: inline-block;
    cursor: pointer;
    width: 5.25rem;
    height: 5.25rem;
    margin: .75rem 0 .75rem .75rem;
    .iconBox {
      background: white;
      border: 1px solid black;
      border-radius: 100%;
      padding: .75rem;
      width: 4.5rem;
      height: 4.5rem;
      text-align: center;
      img {
        width: 3rem;
        height: 3rem;
      }
      p {
        width: 3rem;
        height: 3rem;
        line-height: 100%;
        margin: 0;
      }
    }
  }

  .colorBoxHolder, .iconBoxHolder {
    padding: .3rem;
    &.active {
      padding: .1rem;
      border: .2rem solid green;
    }
  }

  #modalEditGeneric {
    padding: .5rem 1rem 0 0;
    border-bottom: none;
  }

  .text-disabled {
    color: gray;
    &:active, &:focus, &:hover {
      cursor: not-allowed;
      color: gray !important;
      text-decoration: none !important;
    }
  }

  .nonExpandedCatalogEntry, .editRelatedItem {
    width: 100%;
    display: block;

    img, svg {
      max-width: 16px;
      width: 16px;
      max-width: 16px;
      width: 16px;
      display: inline-block;
    }

    .buttonCatalogEntry {
      width: 100%;
      display: block;
    }
  }

  #preview-bar, #preview-drawer {
    .buttonCatalogEntry {
      .active {
        background-color: transparent;
        border: 0;
        width: initial;

        .buttons {
          button.withImage {
            display: none;
          }

          display: flex;
          justify-content: space-around;
          align-items: flex-end;
        }

        h3, div.description, div.help {
          display: none;
        }
      }
    }
  }

</style>

<script>

import CommunityManager from "@/components/dashboardV2/CommunityManager";
import PreviewItem from "@/components/dashboard/PreviewItem";
import {
    createCommunityBar,
    deleteCommunityBar,
    deleteCommunityMember,
    getCommunity,
    getCommunityBar,
    getCommunityBars,
    getCommunityMember,
    getCommunityMembers,
    inviteCommunityMember,
    updateCommunityBar,
    updateCommunityMember
} from "@/services/communityService";
import { buttonCatalog, colors, MESSAGES, allButtons } from "@/utils/constants";
import { predefinedBars } from "@/utils/predefined";
import { Drag, Drop, DropList } from "vue-easy-dnd";
import * as Bar from "@/utils/bar";
import * as search from "@/utils/search";
import EditButtonDialog from "@/views/EditButtonDialog";
import BarItemLink from "@/components/dashboardV2/BarItemLink";

export default {
    name: "MorphicBarEditor",
    components: {
        BarItemLink,
        EditButtonDialog,
        CommunityManager,
        PreviewItem,
        Drag,
        Drop,
        DropList
    },
    methods: {
        buttonRef: function (button) {
            return "button_" + button.id;
        },
        dropToBar: function (event, noImage) {
            this.addBarItem(event.data, event.index, noImage || event.type === "catalogButtonNoImage");
            return true;
        },

        /**
         * Add an item to the bar.
         * @param {BarItem} catalogButton The new button, from the catalog.
         * @param {Number} [insertAt] The index of the new button.
         * @param {Boolean} [noImage] True if the button shall have no image.
         */
        addBarItem: function (catalogButton, insertAt, noImage) {
            /** @type {BarItem} */
            const barItem = Bar.addItem(this.barDetails, catalogButton, insertAt);
            if (noImage) {
                barItem.configuration.image_url = "";
            }

            // close any expanded button
            this.expandedCatalogButtonId = undefined;
            this.setBarChanged();


            var showEdit;
            if (barItem.data.isPlaceholder) {
                showEdit = true;
            } else {
                showEdit = barItem.data.hasError;
            }

            // Edit the button, if it has parameterised fields.
            if (showEdit) {
                this.showEditDialog(barItem);
            }
        },

        setBarChanged: function () {
            this.isChanged = true;
            this.barSelectedInDropdown = "customized";
            Bar.checkBar(this.barDetails);
        },

        revertBar: function () {
            if (window.confirm("Are you sure you want reload last saved version of the bar? This means you will loose all unsaved changes!")) {
                this.isChanged = false;
                this.barDetails = JSON.parse(JSON.stringify(this.originalBarDetails));
                this.barSelectedInDropdown = this.barDetails.id;
            }
        },
        dropOnClickToAdd: function (event) {
            this.dropToBar(event);
        },
        changeUserBarToCommunityBar: function () {
            if (this.isChanged || !this.barDetails.is_shared) {
                if (!confirm("Warning! Changing to a different community bar will delete all MorphicBar customizations for this member.")) {
                    return;
                }
            }

            // if we've made it to this point, either the the user was already using a community bar, or has accepted to loose customized data
            updateCommunityMember(this.community.id, this.memberDetails.id, {
                first_name: this.memberDetails.first_name,
                last_name: this.memberDetails.last_name,
                bar_id: this.barSelectedInDropdown,
                role: this.memberDetails.role
            }).then(r => {
                getCommunityBar(this.community.id, this.barSelectedInDropdown).then(newBarDetails => {
                    this.barDetails = newBarDetails.data;
                    this.isChanged = false;
                    this.newBar = false;
                    this.memberDetails.bar_id = this.barSelectedInDropdown;
                    this.updateOriginalBarDetails();
                });
            });
        },
        // used to avoid bug where a "click" event is triggered at end of drag
        setDragInProgress: function (newValue) {
            this.dragInProgress = newValue;
        },

        removeButton: function (item, itemList) {
            const compareObjects = function (x, y) {
                for (const key in x) {
                    if (x[key] !== y[key]) {
                        return false;
                    } else {
                        if (x[key] instanceof Object && y[key] instanceof Object) {
                            if (compareObjects(x[key], y[key]) === false) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            };
            const index = itemList.findIndex(x => compareObjects(x, item));
            itemList.splice(index, 1);
        },

        getEmailAndSendInvite() {
            this.invitationEmail = "";
            this.$bvModal.show("sendEmailInvitationModal");
        },
        sendInvite() {
            if (this.invitationEmail) {
                const communityId = this.$store.getters.communityId;
                inviteCommunityMember(communityId, this.memberDetails.id, this.invitationEmail);
                this.memberDetails.state = "invited";
            }
        },

        loadAllData: function () {
            this.loadBarData();
            this.loadBarMembers();
            this.getCommunityData();

            if (this.activeMemberId) {
                this.loadMemberData();
            }
        },

        /** Loads the initial bar data */
        loadBarData: function () {
            var barId = this.$route.query.barId;

            if (barId === "new") {
                // Create a new empty bar.
                this.newBar = true;
                this.barDetails = this.newBarDetails;
            } else if (barId.indexOf("predefined") !== -1) {
                // Create a bar from the predefined collection.
                const bar = this.predefinedBars.find(function (predefined) {
                    return predefined.id === barId;
                });

                if (bar) {
                    this.newBar = true;
                    this.barDetails = this.newBarDetails;
                    this.barDetails.items = bar.items;
                    this.addBar();
                }
            } else {
                const unsavedBar = this.$store.getters.unsavedBar;
                if (unsavedBar && unsavedBar.id === barId) {
                    this.barDetails = unsavedBar;
                } else {
                    // Load a saved bar.
                    getCommunityBar(this.communityId, barId)
                        .then(resp => {
                            this.barDetails = resp.data;
                            this.originalBarDetails = JSON.parse(JSON.stringify(this.barDetails));
                        })
                        .catch(err => {
                            console.error(err);
                        });
                }
            }
        },
        addIds: function (items) {
            items.forEach(item => { item.id = this.generateId(item); });
        },
        // hack to refresh css rendering due to bars being fucked up in their CSS
        refreshBar() {
            const myref = this.$refs.myref;
            if (myref) {
                myref.classList.toggle("minWidth1px");
            }
        },
        distributeItems: function (items) {
            // add id's
            this.addIds(items);
            // items.map(item => item.id = this.generateId(item));
        },
        deleteMember: function () {
            deleteCommunityMember(this.communityId, this.memberDetails.id)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.successfulMemberDelete);
                        this.$router.push("/dashboard");
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        changeMemberRole: function () {
            if (this.memberDetails.role === "member") {
                this.memberDetails.role = "manager";
            } else {
                this.memberDetails.role = "member";
            }
            updateCommunityMember(this.communityId, this.memberDetails.id, this.memberDetails)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.successfulRoleChange);
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        updateOriginalBarDetails: function () {
            this.originalBarDetails = JSON.parse(JSON.stringify(this.barDetails));
        },
        addPersonalBar: function () {
            if (this.barDetails.is_shared) {
                this.onSave = true;

                this.barDetails.name = this.memberDetails.first_name;
                this.barDetails.is_shared = false;

                const data = this.barDetails;
                // const drawerItems = this.drawerItems.concat(this.drawerItemsSecond)
                // data.items = this.primaryItems.concat(drawerItems)

                createCommunityBar(this.communityId, data)
                    .then((resp) => {
                        if (resp.status === 200) {
                            this.memberDetails.bar_id = resp.data.bar.id;
                            updateCommunityMember(this.communityId, this.memberDetails.id, this.memberDetails)
                                .then((resp) => {
                                    if (resp.status === 200) {
                                        this.showMessage(MESSAGES.barUpdated);
                                        this.isChanged = false;
                                        this.updateOriginalBarDetails();
                                    }
                                })
                                .catch(err => {
                                    console.error(err);
                                });
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    });
            } else {
                this.saveBar();
            }
        },
        addBar: function () {
            this.onSave = true;
            const data = this.barDetails;
            data.is_shared = true;
            // const drawerItems = this.drawerItems.concat(this.drawerItemsSecond)
            // data.items = this.primaryItems.concat(drawerItems)

            createCommunityBar(this.communityId, data)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.barAdded);
                        this.isChanged = false;
                        this.updateOriginalBarDetails();

                        this.$router.push("/dashboard");
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        saveBar: function () {
            this.onSave = true;
            const data = this.barDetails;
            // const drawerItems = this.drawerItems.concat(this.drawerItemsSecond)
            // data.items = this.primaryItems.concat(drawerItems)

            // Set the image_path for the items, for images which the client does not have locally.
            data.items.forEach(item => {
                item.configuration.image_path = this.getIconUrl(item.configuration.image_url);
            });

            updateCommunityBar(this.communityId, this.$route.query.barId, data)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.barUpdated);
                        this.isChanged = false;
                        this.updateOriginalBarDetails();
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        deleteBar: function () {
            deleteCommunityBar(this.communityId, this.$route.query.barId)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.successfulBarDelete);
                        this.$router.push("/dashboard");
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        /**
         * A key is pressed, while a catalog item is focused.
         * @param {KeyboardEvent} $event The event.
         * @param {BarItem} button The button.
         */
        onCatalogItemKeyPress: function ($event, button) {
            if ($event.key === "Enter") {
                this.dropToBar({data: button});
            }
        },
        expandCatalogButton: function (button, buttonId, subkind) {
            if (!button) {
                this.expandedCatalogButtonId = undefined;
                this.expandedCatalogButton = undefined;
            } else if (button.data.isExpander) {
                this.showSecondaryItems(subkind);
                this.expandedCatalogButtonId = undefined;
                this.expandedCatalogButton = undefined;
            } else {
                this.expandedCatalogButtonId = buttonId;
                this.expandedCatalogButton = button;
                this.$refs["catalog_" + buttonId][0].focus();
            }
        },

        /**
         * Toggles the catalog items under the "Other" - causes the secondary items to show/hide.
         * @param {String} subkind The catalog group id.
         * @param {Boolean} [show] true/false to show/hide, omit to toggle.
         */
        showSecondaryItems: function (subkind, show) {
            if (show === undefined) {
                this.secondaryItemsShown[subkind] = !this.secondaryItemsShown[subkind];
            } else {
                this.secondaryItemsShown[subkind] = show;
            }
        },

        /**
         * Shows the edit button dialog.
         * @param {BarItem} [item] The item to edit.
         */
        showEditDialog: function (item) {
            if (!this.dragInProgress) {
                this.selectedItem = item;
                this.editDialog.showDialog(item).then(changed => {
                    Bar.checkBar(this.barDetails);
                    if (changed) {
                        this.setBarChanged();
                    }
                    this.$forceUpdate();
                });
            }
        },
        getMembersCount: function () {
            if (this.members && this.members.length > 0) {
                return this.members.length;
            }
            return 0;
        },
        loadBarMembers: function () {
            getCommunityBars(this.communityId)
                .then(resp => {
                    const barsData = resp.data.bars;
                    getCommunityMembers(this.communityId)
                        .then((resp) => {
                            this.barsList = barsData;
                            this.membersList = resp.data.members;
                            this.membersList = this.membersList.map(m => { return m.bar_id ? m : Object.assign(m, { bar_id: this.community.default_bar_id }); });

                            if (resp.data.members.length > 0) {
                                for (let i = 0; i < resp.data.members.length; i++) {
                                    if (this.$route.query.barId === resp.data.members[i].bar_id) {
                                        this.members.push(resp.data.members[i]);
                                    }
                                }
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        });
                })
                .catch(err => {
                    console.error(err);
                });
        },
        getBarRemoveValidity: function () {
            if (this.barDetails.name !== "Default" && this.getMembersCount() === 0) {
                return true;
            }
            return false;
        },
        loadMemberData: function () {
            getCommunityMember(this.communityId, this.activeMemberId)
                .then((resp) => {
                    this.memberDetails = resp.data;
                })
                .catch(err => {
                    console.error(err);
                });
        },
        getCommunityData: function () {
            getCommunity(this.communityId)
                .then((community) => {
                    this.community = community.data;
                })
                .catch(err => {
                    console.error(err);
                });
        },
        updateAvailableBars() {
            this.availableBars = this.barsList.filter((bar) => {
                return bar.is_shared;
            });
        },
        highlight(value, buttons) {
            for (let a = 1; a < arguments.length; a++) {
                this.makeArray(arguments[a]).forEach(button => {
                    const preview = this.$refs[this.buttonRef(button)];
                    if (preview) {
                        preview.classList.toggle("highlight", !!value);
                    }
                });
            }
        },
        /**
         * Returns the label for an item in the catalog.
         * @param {BarItem} button The button
         * @param {Array<String>} [searchWords] The words from the search, to highlight.
         * @return {String} Label for the item, as raw HTML.
         */
        getCatalogItemLabel: function (button, searchWords) {
            const label = button.data.catalogLabel || button.configuration.label;
            // escape any html
            const escaped = new Option(label).innerHTML;

            let html;
            if (searchWords && searchWords.length > 0) {
                const highlight = new RegExp(searchWords.join("|"), "gi");
                html = escaped.replace(highlight, "<b>$&</b>");
            } else {
                html = escaped;
            }

            return html;
        },
        searchCatalog() {
            if (this.searchText.length > 0) {
                const queryWords = this.searchText.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().split(/\s+/g);
                // Only the top 20 - they are slow to render.
                const results = search.catalogSearch(queryWords)
                    .sort((a, b) => a.order - b.order)
                    .slice(0, 20);

                /** @type {ButtonCatalogItem} */
                const groups = {
                    itemsFound: {
                        isSearchResult: true,
                        searchWords: queryWords,
                        hasSecondary: false,
                        items: {},
                        hidden: results.length === 0
                    }
                };

                // Make a catalog group for the results.
                results.forEach(result => {
                    /** @type {BarItem} */
                    if (result.buttonKey) {
                        const item = JSON.parse(JSON.stringify(allButtons[result.buttonKey]));
                        item.searchResult = result;

                        groups.itemsFound.items[result.buttonKey] = item;
                    } else if (result.groupKey) {
                        groups[result.groupKey] = JSON.parse(JSON.stringify(buttonCatalog[result.groupKey]));
                    }
                });

                this.searchResult = groups;
                this.searchState = results.length > 0 ? "gotResults" : "noResults";
            } else {
                this.searchState = null;
                this.searchResult = null;
            }
        }
    },
    computed: {
        activeMemberId: function () { return this.$route.query.memberId; },
        editDialog: function () { return this.$refs.editDialog; }
    },
    mounted() {
        this.loadAllData();
    },
    watch: {
        "barDetails.items": function (newValue, oldValue) {
            this.distributeItems(newValue);
        },
        "memberDetails.id": function (newValue, oldValue) {
            this.updateAvailableBars();
            this.barSelectedInDropdown = this.memberDetails.bar_id;
        },
        barsList: function (newValue) {
            this.updateAvailableBars();
        },
        makeAButtons: function (newValue, oldValue) {
            if (!this.dragMakeAButton) {
                this.makeAButtons = oldValue;
                this.dragMakeAButton = true;
            }
        },
        predefinedButtons: function (newValue, oldValue) {
            if (!this.dragPredefinedButton) {
                this.predefinedButtons = oldValue;
                this.dragPredefinedButton = true;
            }
        },
        drawerItemsSecond: function (newValue, oldValue) {
            if (oldValue.length !== newValue.length) {
                this.isChanged = true;
            }
            let item = {};
            if (newValue && newValue.length > 0) {
                for (let i = 0; i < newValue.length; i++) {
                    if (newValue[i].is_primary === true) {
                        item = newValue[i];
                        item.is_primary = false;
                    }
                }
            }
        },
        isChanged: function () {
            this.$store.dispatch("unsavedChanges", this.isChanged);
            this.$store.dispatch("unsavedBar", this.isChanged && this.barDetails);
        },
        "$route.query": function () {
            this.members = [];
            this.initialChangesPrimaryItems = false;
            this.initialChangesDrawerItems = false;
            this.loadAllData();
        },
        barDetails: {
            handler: function (newValue, oldValue) {
                Bar.checkBar(this.barDetails);
            },
            deep: true
        },
        searchText: function () {
            this.expandCatalogButton(null);
            this.searchCatalog();
        }
    },
    beforeRouteUpdate(to, from, next) {
        if (this.isChanged) {
            const confirm = window.confirm(this.leavePageMessage);
            if (confirm) {
                this.isChanged = false;
                next();
            } else {
                next(false);
            }
        } else {
            next();
        }
    },
    beforeRouteLeave(to, from, next) {
        if (this.isChanged) {
            const confirm = window.confirm(this.leavePageMessage);
            if (confirm) {
                next();
            } else {
                next(false);
            }
        } else {
            next();
        }
    },
    beforeUpdate() {
        this.refreshBar();
    },
    data() {
        return {
            // messages
            leavePageMessage: MESSAGES.leavePageAlert,
            availableBars: [],
            barSelectedInDropdown: "",
            // flags
            addToBar: false,
            addToDrawer: false,
            newBar: false,
            openDrawer: true,
            editDialogShown: false,
            tab: 0,
            dragFromEditor: false,
            isChanged: false,
            editBarName: false,
            onSave: false,
            initialChangesPrimaryItems: false,
            initialChangesDrawerItems: false,
            // data for the community manager
            community: {},
            barsList: [],
            membersList: [],

            /** @type {ButtonCatalog} Button catalog. */
            buttonCatalog: buttonCatalog,
            dragInProgress: false,
            expandedCatalogButtonId: null,

            // storage
            buttonStorage: {},
            /**
             * The selected item.
             * @type {BarItem}
             */
            selectedItem: {
                /** @type {BarItemConfiguration} */
                configuration: {
                    label: "hi",
                    color: "",
                    image_url: ""
                },
                data: {}
            },
            invitationEmail: "",
            /** @type {BarDetails} */
            barDetails: {},
            originalBarDetails: {},
            members: [],
            memberDetails: {},
            // drawerItems: [],
            // drawerItemsSecond: [],
            // primaryItems: [],
            // makeAButtons: this.getMakeAButtons(),
            // predefinedButtons: this.getPredefinedButtons(),

            // configurations
            preview: {
                drawer: {
                    w: 2,
                    h: 6
                },
                bar: {
                    h: 100
                }
            },
            newBarDetails: {
                name: "New Bar",
                is_shared: false,
                items: []
            },
            bar: {
                settings: {
                    barOnRight: true,
                    cannotClose: false,
                    startsOpen: false
                }
            },
            predefinedBars: predefinedBars,
            colors: colors,
            checkBarTimer: null,

            /**
             * The display of secondary items in each catalog group.
             * @type {Object<String,Boolean>}
             */
            secondaryItemsShown: Object.keys(buttonCatalog).reduce((map, key) => {
                map[key] = false;
                return map;
            }, {}),

            /**
             * Catalog search text
             * @type {String}
             */
            searchText: "",
            /** null, "gotResults" or "noResults" */
            searchState: null,
            showSearchResults: false,

            /** @type {ButtonCatalog} */
            searchResult: false
        };
    }
};
</script>
